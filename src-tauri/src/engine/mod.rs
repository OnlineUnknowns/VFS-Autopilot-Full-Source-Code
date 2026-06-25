pub mod browser;
pub mod captcha;
pub mod countries;
pub mod notifier;
pub mod proxy;
pub mod scheduler;
pub mod session;

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tokio::sync::{Mutex, RwLock};
use tokio::task::JoinHandle;

use crate::db::{Account, ActivityLog, Booking, DbState};
use browser::create_driver;
use captcha::solve_recaptcha_v2;
use countries::{get_adapter, AccountCredentials, MonitorResult};
use notifier::{emit_frontend, notify_desktop, notify_telegram};
use proxy::ProxyManager;
use scheduler::calculate_next_interval_secs;
use session::{clear_session, load_session_cookies, save_session_cookies, SerializableCookie};

// ─── Shared configuration ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineConfig {
    /// Polling interval in seconds (base, jitter ±15% will be applied)
    pub poll_interval_secs: u64,
    /// Whether to run browser in headless mode
    pub headless: bool,
    /// Whether to automatically book the first available slot
    pub auto_book: bool,
    /// 2Captcha API key (empty string = disabled)
    pub captcha_api_key: String,
    /// Telegram bot token (empty = disabled)
    pub telegram_bot_token: String,
    /// Telegram chat ID
    pub telegram_chat_id: String,
    /// Ordered proxy list in "IP:PORT" or "IP:PORT:USER:PASS" format
    pub proxies: Vec<String>,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            poll_interval_secs: 60,
            headless: true,
            auto_book: false,
            captcha_api_key: String::new(),
            telegram_bot_token: String::new(),
            telegram_chat_id: String::new(),
            proxies: vec![],
        }
    }
}

// ─── Per-task runtime status ─────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Idle,
    Running,
    Paused,
    Error(String),
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorTask {
    pub task_id: String,
    pub account_id: String,
    pub country_id: String,
    pub status: TaskStatus,
    pub last_run_at: Option<String>,
    pub slots_found_last: usize,
    pub error_count: u32,
}

// ─── Engine state ────────────────────────────────────────────────────────────

pub struct EngineState {
    pub config: Arc<RwLock<EngineConfig>>,
    pub proxy_manager: Arc<Mutex<ProxyManager>>,
    /// Map of task_id -> (MonitorTask metadata, JoinHandle)
    pub task_handles: Arc<Mutex<HashMap<String, (MonitorTask, JoinHandle<()>)>>>,
    pub db: Arc<DbState>,
    pub app_handle: tauri::AppHandle,
}

impl EngineState {
    pub fn new(db: Arc<DbState>, app_handle: tauri::AppHandle) -> Self {
        let config = EngineConfig::default();
        let proxies = config.proxies.clone();
        Self {
            config: Arc::new(RwLock::new(config)),
            proxy_manager: Arc::new(Mutex::new(ProxyManager::new(proxies))),
            task_handles: Arc::new(Mutex::new(HashMap::new())),
            db,
            app_handle,
        }
    }

    /// Starts a monitoring task for the given account. If a task for the same
    /// account already exists and is running, this is a no-op.
    pub async fn start_task(&self, account: Account) -> Result<(), String> {
        let task_id = format!("task-{}", account.id);

        {
            let handles = self.task_handles.lock().await;
            if handles.contains_key(&task_id) {
                return Err(format!("Task {} is already running", task_id));
            }
        }

        let adapter = get_adapter(&account.country_id)
            .ok_or_else(|| format!("No adapter for country: {}", account.country_id))?;

        let task_meta = MonitorTask {
            task_id: task_id.clone(),
            account_id: account.id.clone(),
            country_id: account.country_id.clone(),
            status: TaskStatus::Running,
            last_run_at: None,
            slots_found_last: 0,
            error_count: 0,
        };

        // Clone shared state for the spawned async task
        let config_ref = self.config.clone();
        let proxy_mgr = self.proxy_manager.clone();
        let db_ref = self.db.clone();
        let app_handle = self.app_handle.clone();
        let task_handles_ref = self.task_handles.clone();
        let tid = task_id.clone();

        let handle = tokio::spawn(async move {
            loop {
                let config = config_ref.read().await.clone();

                // Select next proxy
                let proxy = proxy_mgr.lock().await.get_next_proxy();

                // Decrypt password — for now we store it directly; in production swap
                // this with the real decryption call.
                let password = account.password_encrypted.clone();

                let creds = AccountCredentials {
                    email: account.email.clone(),
                    password,
                    vac: account.vac.clone(),
                    category: account.category.clone(),
                };

                // Create a fresh browser session for this poll cycle
                let driver_result = create_driver(
                    proxy.as_deref(),
                    config.headless,
                )
                .await;

                let result: MonitorResult = match driver_result {
                    Err(e) => MonitorResult {
                        country_id: adapter.country_id().to_string(),
                        account_email: account.email.clone(),
                        slots_found: vec![],
                        status_message: format!("Browser launch failed: {}", e),
                        has_error: true,
                    },
                    Ok(driver) => {
                        // Restore saved session cookies if available
                        if let Ok(Some(cookies)) =
                            load_session_cookies(&account.email)
                        {
                            for c in &cookies {
                                let _ = driver
                                    .add_cookie(thirtyfour::Cookie::new(
                                        c.name.clone(),
                                        serde_json::Value::String(c.value.clone()),
                                    ))
                                    .await;
                            }
                        }

                        let cycle_result = adapter
                            .run_cycle(&driver, &creds, config.auto_book)
                            .await;

                        // Persist fresh cookies back to disk
                        if let Ok(raw_cookies) = driver.get_all_cookies().await {
                            let serializable: Vec<SerializableCookie> = raw_cookies
                                .iter()
                                .map(|c| SerializableCookie {
                                    name: c.name().to_string(),
                                    value: c.value().to_string(),
                                    domain: c.domain().map(str::to_string),
                                    path: c.path().map(str::to_string),
                                    secure: c.secure(),
                                    http_only: c.http_only(),
                                })
                                .collect();
                            let _ = save_session_cookies(&account.email, serializable);
                        }

                        let _ = driver.quit().await;
                        cycle_result
                    }
                };

                // ── Emit result to frontend ──────────────────────────────
                emit_frontend(&app_handle, "monitor-result", result.clone());

                // ── Persist activity log ─────────────────────────────────
                let log = ActivityLog {
                    id: uuid::Uuid::new_v4().to_string(),
                    log_type: if result.has_error {
                        "error".to_string()
                    } else if !result.slots_found.is_empty() {
                        "success".to_string()
                    } else {
                        "info".to_string()
                    },
                    channel: "engine".to_string(),
                    message: result.status_message.clone(),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                };
                let _ = db_ref.add_log(&log);

                // ── Notifications ────────────────────────────────────────
                if !result.slots_found.is_empty() {
                    let title = format!(
                        "🎯 Slot Found — {}",
                        adapter.display_name()
                    );
                    let body = format!(
                        "{} slot(s) available for {} at {}",
                        result.slots_found.len(),
                        creds.category,
                        creds.vac
                    );
                    let _ = notify_desktop(&app_handle, &title, &body);

                    if !config.telegram_bot_token.is_empty() {
                        let msg = format!("<b>{}</b>\n{}", title, body);
                        let _ = notify_telegram(
                            &config.telegram_bot_token,
                            &config.telegram_chat_id,
                            &msg,
                        )
                        .await;
                    }

                    // Auto-book bookings are already handled inside run_cycle;
                    // persist the booking record here.
                    if config.auto_book {
                        if let Some(slot) = result.slots_found.first() {
                            let booking = Booking {
                                id: uuid::Uuid::new_v4().to_string(),
                                account_id: account.id.clone(),
                                country_id: adapter.country_id().to_string(),
                                vac: slot.vac.clone(),
                                status: "Booked".to_string(),
                                date_found: chrono::Utc::now().to_rfc3339(),
                                booking_date: slot.date.clone(),
                                confirmation_details: Some(
                                    result.status_message.clone(),
                                ),
                            };
                            let _ = db_ref.save_booking(&booking);
                        }
                    }
                }

                // ── Update task metadata ─────────────────────────────────
                {
                    let mut handles = task_handles_ref.lock().await;
                    if let Some((meta, _)) = handles.get_mut(&tid) {
                        meta.last_run_at =
                            Some(chrono::Utc::now().to_rfc3339());
                        meta.slots_found_last = result.slots_found.len();
                        if result.has_error {
                            meta.error_count += 1;
                        } else {
                            meta.error_count = 0;
                        }
                        // If 5 consecutive errors, pause the task
                        if meta.error_count >= 5 {
                            meta.status = TaskStatus::Error(
                                "Too many consecutive errors. Task paused.".to_string(),
                            );
                            emit_frontend(
                                &app_handle,
                                "task-paused",
                                serde_json::json!({ "task_id": tid }),
                            );
                            break;
                        }
                    }
                }

                // ── Wait for next poll cycle with jitter ─────────────────
                let wait = calculate_next_interval_secs(config.poll_interval_secs);
                tokio::time::sleep(Duration::from_secs(wait)).await;
            }
        });

        let mut handles = self.task_handles.lock().await;
        handles.insert(task_id, (task_meta, handle));
        Ok(())
    }

    /// Stops and removes the monitoring task for the given task ID.
    pub async fn stop_task(&self, task_id: &str) -> Result<(), String> {
        let mut handles = self.task_handles.lock().await;
        if let Some((_, handle)) = handles.remove(task_id) {
            handle.abort();
            Ok(())
        } else {
            Err(format!("Task {} not found", task_id))
        }
    }

    /// Returns a snapshot of all current task metadata.
    pub async fn list_tasks(&self) -> Vec<MonitorTask> {
        let handles = self.task_handles.lock().await;
        handles.values().map(|(meta, _)| meta.clone()).collect()
    }

    /// Hot-reloads the engine configuration and updates the proxy manager.
    pub async fn update_config(&self, new_config: EngineConfig) {
        let new_proxies = new_config.proxies.clone();
        {
            let mut cfg = self.config.write().await;
            *cfg = new_config;
        }
        {
            let mut pm = self.proxy_manager.lock().await;
            pm.update_proxies(new_proxies);
        }
    }
}
