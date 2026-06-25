use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SerializableCookie {
  pub name: String,
  pub value: String,
  pub domain: Option<String>,
  pub path: Option<String>,
  pub secure: Option<bool>,
  pub http_only: Option<bool>,
}

/// Resolves path to a local account session cookie cache file.
fn get_session_filepath(email: &str) -> PathBuf {
  // Save in local workspace cache directory
  let mut path = PathBuf::from("sessions");
  if !path.exists() {
    let _ = fs::create_dir_all(&path);
  }
  path.push(format!("{}_session.json", email.replace('@', "_at_")));
  path
}

/// Saves cookies to local disk as a JSON array.
pub fn save_session_cookies(
  email: &str,
  cookies: Vec<SerializableCookie>,
) -> Result<(), Box<dyn Error + Send + Sync>> {
  let file_path = get_session_filepath(email);
  let serialized = serde_json::to_string_pretty(&cookies)?;
  fs::write(file_path, serialized)?;
  Ok(())
}

/// Loads saved cookies from local disk if present.
pub fn load_session_cookies(
  email: &str,
) -> Result<Option<Vec<SerializableCookie>>, Box<dyn Error + Send + Sync>> {
  let file_path = get_session_filepath(email);
  if !file_path.exists() {
    return Ok(None);
  }
  let file_content = fs::read_to_string(file_path)?;
  let cookies: Vec<SerializableCookie> = serde_json::from_str(&file_content)?;
  Ok(Some(cookies))
}

/// Deletes cookie cache on sign-out or session expiry.
pub fn clear_session(email: &str) -> Result<(), Box<dyn Error + Send + Sync>> {
  let file_path = get_session_filepath(email);
  if file_path.exists() {
    fs::remove_file(file_path)?;
  }
  Ok(())
}
