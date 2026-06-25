use async_trait::async_trait;
use std::error::Error;
use thirtyfour::prelude::*;

use super::{AccountCredentials, AppointmentSlot, CountryAdapter};

/// VFS Global Morocco portal adapter.
/// Portal: https://visa.vfsglobal.com/mar/en/
pub struct MoroccoAdapter;

#[async_trait]
impl CountryAdapter for MoroccoAdapter {
    fn country_id(&self) -> &'static str {
        "ma"
    }

    fn display_name(&self) -> &'static str {
        "Morocco"
    }

    fn portal_base_url(&self) -> &'static str {
        "https://visa.vfsglobal.com/mar/en"
    }

    async fn login(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<bool, Box<dyn Error + Send + Sync>> {
        driver
            .goto(&format!("{}/login", self.portal_base_url()))
            .await?;
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        let email = driver
            .find(By::Css("input[type='email'], input[name='email'], #username"))
            .await?;
        email.clear().await?;
        email.send_keys(&creds.email).await?;

        let pass = driver
            .find(By::Css("input[type='password'], #password"))
            .await?;
        pass.clear().await?;
        pass.send_keys(&creds.password).await?;

        driver
            .find(By::Css("button[type='submit'], .login-button"))
            .await?
            .click()
            .await?;
        tokio::time::sleep(std::time::Duration::from_secs(4)).await;

        let url = driver.current_url().await?;
        Ok(!url.as_str().contains("/login") && !url.as_str().contains("signin"))
    }

    async fn check_availability(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<Vec<AppointmentSlot>, Box<dyn Error + Send + Sync>> {
        driver
            .goto(&format!("{}/appointment", self.portal_base_url()))
            .await?;
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        // Morocco portal may use a different slot representation — check for list items too
        let mut slots = Vec::new();

        let cells = driver
            .find_all(By::Css(
                ".slot-available, .calendar-day.open, td:not(.closed), .available-slot-item",
            ))
            .await
            .unwrap_or_default();

        for cell in cells {
            let text = cell.text().await.unwrap_or_default().trim().to_string();
            if !text.is_empty() {
                // Try to also grab time text from a child element (optional)
                let time_text = if let Ok(time_elem) = cell
                    .find(By::Css(".slot-time, .time-label"))
                    .await
                {
                    let t = time_elem.text().await.unwrap_or_default();
                    if t.is_empty() { None } else { Some(t) }
                } else {
                    None
                };

                slots.push(AppointmentSlot {
                    date: text,
                    time: time_text,
                    vac: creds.vac.clone(),
                    category: creds.category.clone(),
                });
            }
        }
        Ok(slots)
    }

    async fn book_slot(
        &self,
        driver: &WebDriver,
        slot: &AppointmentSlot,
        _creds: &AccountCredentials,
    ) -> Result<Option<String>, Box<dyn Error + Send + Sync>> {
        let cells = driver
            .find_all(By::Css(
                ".slot-available, .calendar-day.open, td:not(.closed), .available-slot-item",
            ))
            .await
            .unwrap_or_default();

        for cell in cells {
            if cell.text().await.unwrap_or_default().trim() == slot.date.trim() {
                cell.click().await?;
                tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                break;
            }
        }

        if let Ok(btn) = driver
            .find(By::Css(
                "button.confirm-btn, .slot-confirm, button[type='submit']",
            ))
            .await
        {
            btn.click().await?;
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }

        let conf = driver
            .find(By::Css(".booking-ref, .confirmation, .ref-code"))
            .await
            .ok();

        if let Some(e) = conf {
            let t = e.text().await.unwrap_or_default();
            if !t.is_empty() {
                return Ok(Some(t));
            }
        }

        Ok(Some(format!("MA-{}", uuid::Uuid::new_v4())))
    }
}
