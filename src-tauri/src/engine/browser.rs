use std::error::Error;
use thirtyfour::prelude::*;

/// Launches a new Selenium webdriver session connected to chromedriver at localhost:9515.
/// Applies anti-fingerprinting parameters, incognito mode, custom user-agents, and optional proxy configurations.
pub async fn create_driver(
  proxy_server: Option<&str>,
  headless: bool,
) -> Result<WebDriver, Box<dyn Error + Send + Sync>> {
  let mut caps = DesiredCapabilities::chrome();
  
  // Standard headless / performance parameters
  caps.add_chrome_arg("--disable-gpu")?;
  caps.add_chrome_arg("--no-sandbox")?;
  caps.add_chrome_arg("--disable-dev-shm-usage")?;
  caps.add_chrome_arg("--incognito")?;
  
  if headless {
    caps.add_chrome_arg("--headless")?;
  }

  // Anti-detection parameter configurations
  caps.add_chrome_arg("--disable-blink-features=AutomationControlled")?;
  
  // Custom user agent
  caps.add_chrome_arg(
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  )?;

  // Set proxy capability if active
  if let Some(p) = proxy_server {
    caps.add_chrome_arg(&format!("--proxy-server={}", p))?;
  }

  // Connect to the chromedriver endpoint
  let driver = WebDriver::new("http://localhost:9515", caps).await?;
  
  // Set window size for standard layouts
  driver.set_window_size(1280, 800).await?;

  Ok(driver)
}
