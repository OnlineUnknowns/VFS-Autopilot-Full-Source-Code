pub mod pakistan;
pub mod india;
pub mod angola;
pub mod morocco;
pub mod algeria;
pub mod egypt;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::error::Error;
use thirtyfour::prelude::*;

// ─── Shared types ────────────────────────────────────────────────────────────

/// Represents a single available appointment slot returned by the portal.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppointmentSlot {
    /// ISO-8601 date string, e.g. "2025-09-15"
    pub date: String,
    /// Human-readable time string, e.g. "10:30 AM"
    pub time: Option<String>,
    /// Visa Application Centre identifier
    pub vac: String,
    /// Visa category / appointment type label
    pub category: String,
}

/// Summary result emitted after every monitoring cycle.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorResult {
    pub country_id: String,
    pub account_email: String,
    pub slots_found: Vec<AppointmentSlot>,
    /// Human-readable status message for the activity log
    pub status_message: String,
    /// Whether an error occurred during this cycle
    pub has_error: bool,
}

/// Credentials used to authenticate a VFS account.
#[derive(Debug, Clone)]
pub struct AccountCredentials {
    pub email: String,
    pub password: String,
    pub vac: String,
    pub category: String,
}

// ─── Core trait ──────────────────────────────────────────────────────────────

/// All country-specific portal automation must implement this trait.
/// Each method receives the shared `WebDriver` handle so that session
/// state (cookies, local storage) persists across calls within a cycle.
#[async_trait]
pub trait CountryAdapter: Send + Sync {
    /// A stable, short identifier for this country, e.g. "pk", "in".
    fn country_id(&self) -> &'static str;

    /// The human-readable display name shown in logs/notifications.
    fn display_name(&self) -> &'static str;

    /// The base URL of the VFS portal for this country.
    fn portal_base_url(&self) -> &'static str;

    /// Navigates to the login page and authenticates using the provided
    /// credentials.  Returns `Ok(true)` on success, `Ok(false)` if login
    /// was rejected (wrong password / account locked), or an `Err` for
    /// infrastructure failures (network timeout, page parse error, etc.).
    async fn login(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<bool, Box<dyn Error + Send + Sync>>;

    /// Navigates to the appointment availability page for the given VAC and
    /// category, scrapes all visible slots, and returns them.
    async fn check_availability(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<Vec<AppointmentSlot>, Box<dyn Error + Send + Sync>>;

    /// Attempts to book the first available slot from the provided list.
    /// Returns `Ok(Some(confirmation_ref))` on a successful booking, or
    /// `Ok(None)` if the slot was no longer available by the time booking
    /// was attempted (race condition).
    async fn book_slot(
        &self,
        driver: &WebDriver,
        slot: &AppointmentSlot,
        creds: &AccountCredentials,
    ) -> Result<Option<String>, Box<dyn Error + Send + Sync>>;

    /// Convenience helper: runs a full monitor cycle (login → check → optionally
    /// book) and returns a consolidated `MonitorResult`.  Default implementation
    /// delegates to the three methods above; individual adapters may override if
    /// they need a different control flow.
    async fn run_cycle(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
        auto_book: bool,
    ) -> MonitorResult {
        // Step 1 — Login
        match self.login(driver, creds).await {
            Err(e) => {
                return MonitorResult {
                    country_id: self.country_id().to_string(),
                    account_email: creds.email.clone(),
                    slots_found: vec![],
                    status_message: format!("[{}] Login error: {}", self.display_name(), e),
                    has_error: true,
                };
            }
            Ok(false) => {
                return MonitorResult {
                    country_id: self.country_id().to_string(),
                    account_email: creds.email.clone(),
                    slots_found: vec![],
                    status_message: format!(
                        "[{}] Login rejected for {}",
                        self.display_name(),
                        creds.email
                    ),
                    has_error: true,
                };
            }
            Ok(true) => {}
        }

        // Step 2 — Check availability
        let slots = match self.check_availability(driver, creds).await {
            Ok(s) => s,
            Err(e) => {
                return MonitorResult {
                    country_id: self.country_id().to_string(),
                    account_email: creds.email.clone(),
                    slots_found: vec![],
                    status_message: format!(
                        "[{}] Availability check error: {}",
                        self.display_name(),
                        e
                    ),
                    has_error: true,
                };
            }
        };

        if slots.is_empty() {
            return MonitorResult {
                country_id: self.country_id().to_string(),
                account_email: creds.email.clone(),
                slots_found: vec![],
                status_message: format!(
                    "[{}] No slots available for {} at {}",
                    self.display_name(),
                    creds.category,
                    creds.vac
                ),
                has_error: false,
            };
        }

        // Step 3 — Optionally auto-book the first slot
        if auto_book {
            let first = &slots[0];
            match self.book_slot(driver, first, creds).await {
                Ok(Some(ref_id)) => {
                    return MonitorResult {
                        country_id: self.country_id().to_string(),
                        account_email: creds.email.clone(),
                        slots_found: slots,
                        status_message: format!(
                            "[{}] ✅ Booked! Confirmation: {}",
                            self.display_name(),
                            ref_id
                        ),
                        has_error: false,
                    };
                }
                Ok(None) => {
                    return MonitorResult {
                        country_id: self.country_id().to_string(),
                        account_email: creds.email.clone(),
                        slots_found: slots,
                        status_message: format!(
                            "[{}] Slot was taken before booking (race condition)",
                            self.display_name()
                        ),
                        has_error: false,
                    };
                }
                Err(e) => {
                    return MonitorResult {
                        country_id: self.country_id().to_string(),
                        account_email: creds.email.clone(),
                        slots_found: slots,
                        status_message: format!(
                            "[{}] Booking error: {}",
                            self.display_name(),
                            e
                        ),
                        has_error: true,
                    };
                }
            }
        }

        MonitorResult {
            country_id: self.country_id().to_string(),
            account_email: creds.email.clone(),
            slots_found: slots.clone(),
            status_message: format!(
                "[{}] 🎯 {} slot(s) found for {} at {}",
                self.display_name(),
                slots.len(),
                creds.category,
                creds.vac
            ),
            has_error: false,
        }
    }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/// Returns a boxed `CountryAdapter` for the given country ID string.
/// Returns `None` for unknown country IDs.
pub fn get_adapter(country_id: &str) -> Option<Box<dyn CountryAdapter>> {
    match country_id {
        "pk" => Some(Box::new(pakistan::PakistanAdapter)),
        "in" => Some(Box::new(india::IndiaAdapter)),
        "ao" => Some(Box::new(angola::AngolaAdapter)),
        "ma" => Some(Box::new(morocco::MoroccoAdapter)),
        "dz" => Some(Box::new(algeria::AlgeriaAdapter)),
        "eg" => Some(Box::new(egypt::EgyptAdapter)),
        _ => None,
    }
}
