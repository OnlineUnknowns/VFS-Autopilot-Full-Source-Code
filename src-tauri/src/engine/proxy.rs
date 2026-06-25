use std::error::Error;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{Duration, Instant};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct ProxyTestResult {
  pub proxy: String,
  pub success: bool,
  pub latency_ms: u64,
}

pub struct ProxyManager {
  proxies: Vec<String>,
  current_index: AtomicUsize,
}

impl ProxyManager {
  pub fn new(proxy_list: Vec<String>) -> Self {
    Self {
      proxies: proxy_list,
      current_index: AtomicUsize::new(0),
    }
  }

  /// Rotates to the next proxy from the loaded settings list.
  pub fn get_next_proxy(&self) -> Option<String> {
    if self.proxies.is_empty() {
      return None;
    }
    let idx = self.current_index.fetch_add(1, Ordering::SeqCst);
    let proxy = &self.proxies[idx % self.proxies.len()];
    Some(proxy.clone())
  }

  pub fn update_proxies(&mut self, new_list: Vec<String>) {
    self.proxies = new_list;
    self.current_index.store(0, Ordering::SeqCst);
  }
}

/// Runs a real HTTP connection check on a proxy string.
/// Connects to a public endpoint with a 5-second timeout, measuring response speed.
pub async fn test_proxy_connection(proxy_str: &str) -> Result<ProxyTestResult, Box<dyn Error + Send + Sync>> {
  let start = Instant::now();
  
  // Parse proxy components: IP:PORT[:USER:PASS]
  let parts: Vec<&str> = proxy_str.split(':').collect();
  if parts.len() < 2 {
    return Err("Invalid proxy format. Use IP:PORT or IP:PORT:USER:PASS".into());
  }

  let proxy_url = format!("http://{}:{}", parts[0], parts[1]);
  let mut proxy = reqwest::Proxy::all(&proxy_url)?;

  if parts.len() >= 4 {
    proxy = proxy.basic_auth(parts[2], parts[3]);
  }

  let client = reqwest::Client::builder()
    .proxy(proxy)
    .timeout(Duration::from_secs(5))
    .build()?;

  // Test against a stable connection endpoint
  let res = client.get("https://httpbin.org/ip").send().await;
  let elapsed = start.elapsed().as_millis() as u64;

  match res {
    Ok(response) => {
      let is_success = response.status().is_success();
      Ok(ProxyTestResult {
        proxy: proxy_str.to_string(),
        success: is_success,
        latency_ms: if is_success { elapsed } else { 0 },
      })
    }
    Err(_) => Ok(ProxyTestResult {
      proxy: proxy_str.to_string(),
      success: false,
      latency_ms: 0,
    }),
  }
}
