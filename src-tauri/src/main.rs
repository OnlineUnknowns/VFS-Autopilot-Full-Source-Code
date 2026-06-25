#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod db;
mod engine;

use std::sync::Arc;
use tauri::Manager;

use db::{Account, ActivityLog, Booking, DbState};
use engine::{EngineConfig, EngineState};

// ─── Tauri State Wrapper ─────────────────────────────────────────────────────

pub struct AppState {
    pub engine: Arc<EngineState>,
}

// ─── Database Commands ───────────────────────────────────────────────────────

#[tauri::command]
async fn get_accounts(state: tauri::State<'_, AppState>) -> Result<Vec<Account>, String> {
    state
        .engine
        .db
        .get_accounts()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_account(
    state: tauri::State<'_, AppState>,
    account: Account,
) -> Result<(), String> {
    state
        .engine
        .db
        .save_account(&account)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_account(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    state
        .engine
        .db
        .delete_account(&id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_account_status(
    state: tauri::State<'_, AppState>,
    id: String,
    is_active: bool,
) -> Result<(), String> {
    state
        .engine
        .db
        .update_account_status(&id, is_active)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_bookings(state: tauri::State<'_, AppState>) -> Result<Vec<Booking>, String> {
    state
        .engine
        .db
        .get_bookings()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_logs(state: tauri::State<'_, AppState>) -> Result<Vec<ActivityLog>, String> {
    state
        .engine
        .db
        .get_logs()
        .map_err(|e| e.to_string())
}

// ─── Engine Commands ─────────────────────────────────────────────────────────

#[tauri::command]
async fn start_monitoring(
    state: tauri::State<'_, AppState>,
    account_id: String,
) -> Result<(), String> {
    let accounts = state
        .engine
        .db
        .get_accounts()
        .map_err(|e| e.to_string())?;

    let account = accounts
        .into_iter()
        .find(|a| a.id == account_id)
        .ok_or_else(|| format!("Account {} not found", account_id))?;

    state.engine.start_task(account).await
}

#[tauri::command]
async fn stop_monitoring(
    state: tauri::State<'_, AppState>,
    task_id: String,
) -> Result<(), String> {
    state.engine.stop_task(&task_id).await
}

#[tauri::command]
async fn start_all_monitoring(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let accounts = state
        .engine
        .db
        .get_accounts()
        .map_err(|e| e.to_string())?;

    let mut started = Vec::new();
    let mut errors = Vec::new();

    for account in accounts {
        if !account.is_active {
            continue;
        }
        let id = account.id.clone();
        match state.engine.start_task(account).await {
            Ok(_) => started.push(id),
            Err(e) => errors.push(format!("{}: {}", id, e)),
        }
    }

    if !errors.is_empty() {
        eprintln!("[Engine] Some tasks failed to start: {:?}", errors);
    }

    Ok(started)
}

#[tauri::command]
async fn stop_all_monitoring(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let tasks = state.engine.list_tasks().await;
    for task in tasks {
        let _ = state.engine.stop_task(&task.task_id).await;
    }
    Ok(())
}

#[tauri::command]
async fn list_tasks(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<engine::MonitorTask>, String> {
    Ok(state.engine.list_tasks().await)
}

#[tauri::command]
async fn update_engine_config(
    state: tauri::State<'_, AppState>,
    config: EngineConfig,
) -> Result<(), String> {
    state.engine.update_config(config).await;
    Ok(())
}

#[tauri::command]
async fn get_engine_config(
    state: tauri::State<'_, AppState>,
) -> Result<EngineConfig, String> {
    Ok(state.engine.config.read().await.clone())
}

#[tauri::command]
async fn test_proxy(proxy_str: String) -> Result<engine::proxy::ProxyTestResult, String> {
    engine::proxy::test_proxy_connection(&proxy_str)
        .await
        .map_err(|e| e.to_string())
}

// ─── Entrypoint ──────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Resolve a writable app data path for the SQLite database
            let app_dir = app
                .path_resolver()
                .app_data_dir()
                .expect("Failed to resolve app data directory");

            std::fs::create_dir_all(&app_dir)
                .expect("Failed to create app data directory");

            let db_path = app_dir.join("velix.db");

            let db = Arc::new(
                DbState::new(&db_path)
                    .expect("Failed to initialise SQLite database"),
            );

            let engine_state = Arc::new(EngineState::new(db, app.handle()));

            app.manage(AppState {
                engine: engine_state,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Database
            get_accounts,
            save_account,
            delete_account,
            update_account_status,
            get_bookings,
            get_logs,
            // Engine control
            start_monitoring,
            stop_monitoring,
            start_all_monitoring,
            stop_all_monitoring,
            list_tasks,
            update_engine_config,
            get_engine_config,
            // Utilities
            test_proxy,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
