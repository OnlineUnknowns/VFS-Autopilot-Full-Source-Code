use rand::Rng;

/// Calculates the next query polling delay in seconds.
/// Applies a random jitter between -15% and +15% of the base interval.
/// Ensures the final sleep delay is never less than a safety minimum of 15 seconds.
pub fn calculate_next_interval_secs(base_interval_secs: u64) -> u64 {
  let mut rng = rand::thread_rng();
  
  // Calculate jitter multiplier between -0.15 and +0.15
  let jitter: f64 = rng.gen_range(-0.15..=0.15);
  let offset = (base_interval_secs as f64 * jitter).round() as i64;
  
  let next_interval = base_interval_secs as i64 + offset;
  
  if next_interval < 15 {
    15
  } else {
    next_interval as u64
  }
}
