use std::error::Error;
use std::time::{Duration, Instant};
use tokio::time::sleep;

/// Submits a ReCaptcha V2 task to the 2Captcha API and polls for the solved token string.
/// If a mock key is provided, it simulates solving with a 3-second delay.
pub async fn solve_recaptcha_v2(
  api_key: &str,
  site_key: &str,
  page_url: &str,
) -> Result<String, Box<dyn Error + Send + Sync>> {
  // If the API key looks like a mock, run a simulation
  if api_key.is_empty() || api_key == "mock_key" || api_key.contains("12345") {
    sleep(Duration::from_secs(3)).await;
    return Ok(format!("mock_solved_token_{}", uuid::Uuid::new_v4()));
  }

  let client = reqwest::Client::new();

  // 1. Submit captcha task to 2captcha php endpoint
  let submit_url = format!(
    "https://2captcha.com/in.php?key={}&method=userrecaptcha&googlekey={}&pageurl={}&json=1",
    api_key, site_key, page_url
  );

  let submit_res = client.get(&submit_url).send().await?.text().await?;
  let submit_json: serde_json::Value = serde_json::from_str(&submit_res)?;

  if submit_json["status"].as_i64() != Some(1) {
    let err_msg = submit_json["request"].as_str().unwrap_or("Unknown Submission Error");
    return Err(format!("2Captcha submission failed: {}", err_msg).into());
  }

  let task_id = submit_json["request"]
    .as_str()
    .ok_or("Failed to parse 2Captcha task ID")?;

  // 2. Poll result loop (every 5 seconds, up to 120 seconds timeout)
  let poll_url = format!(
    "https://2captcha.com/res.php?key={}&action=get&id={}&json=1",
    api_key, task_id
  );

  let start_time = Instant::now();
  let timeout = Duration::from_secs(120);

  loop {
    if start_time.elapsed() > timeout {
      return Err("2Captcha task timed out".into());
    }

    sleep(Duration::from_secs(5)).await;

    let poll_res = client.get(&poll_url).send().await?.text().await?;
    let poll_json: serde_json::Value = serde_json::from_str(&poll_res)?;

    let status = poll_json["status"].as_i64();
    if status == Some(1) {
      let token = poll_json["request"]
        .as_str()
        .ok_or("Failed to parse token from 2Captcha response")?;
      return Ok(token.to_string());
    } else if status == Some(0) {
      let request_text = poll_json["request"].as_str().unwrap_or("");
      if request_text == "CAPCHA_NOT_READY" {
        continue;
      }
      return Err(format!("2Captcha polling error: {}", request_text).into());
    } else {
      return Err("Invalid response status from 2Captcha".into());
    }
  }
}
