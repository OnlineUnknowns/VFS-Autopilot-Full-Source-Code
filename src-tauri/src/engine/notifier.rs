use std::error::Error;
use tauri::Manager;

/// Sends a native OS desktop notification alert.
/// Uses the built-in Tauri v1 Notification API for maximum compatibility.
pub fn notify_desktop(
  app_handle: &tauri::AppHandle,
  title: &str,
  body: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
  let bundle_identifier = &app_handle.config().tauri.bundle.identifier;
  
  tauri::api::notification::Notification::builder(bundle_identifier)
    .title(title)
    .body(body)
    .show()?;
    
  Ok(())
}

/// Dispatches a Telegram bot channel alert using the HTTP Client.
pub async fn notify_telegram(
  bot_token: &str,
  chat_id: &str,
  message: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
  let client = reqwest::Client::new();
  let url = format!(
    "https://api.telegram.org/bot{}/sendMessage",
    bot_token
  );

  let payload = serde_json::json!({
    "chat_id": chat_id,
    "text": message,
    "parse_mode": "HTML"
  });

  let response = client
    .post(&url)
    .json(&payload)
    .send()
    .await?;

  if !response.status().is_success() {
    let err_body = response.text().await?;
    return Err(format!("Telegram API error: {}", err_body).into());
  }

  Ok(())
}

/// Emits an async event from the Rust core to the frontend React webview.
pub fn emit_frontend<T: serde::Serialize + Clone>(
  app_handle: &tauri::AppHandle,
  event_name: &str,
  payload: T,
) {
  if let Err(e) = app_handle.emit_all(event_name, payload) {
    eprintln!("[Notifier] Failed to emit event {}: {:?}", event_name, e);
  }
}
