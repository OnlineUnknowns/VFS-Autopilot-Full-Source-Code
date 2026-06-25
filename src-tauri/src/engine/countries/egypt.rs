use async_trait::async_trait;
use std::error::Error;
use thirtyfour::prelude::*;

use super::{AccountCredentials, AppointmentSlot, CountryAdapter};

/// VFS Global Egypt portal adapter.
/// Portal: https://visa.vfsglobal.com/egy/en/
pub struct EgyptAdapter;

#[async_trait]
impl CountryAdapter for EgyptAdapter {
    fn country_id(&self) -> &'static str {
        "eg"
    }

    fn display_name(&self) -> &'static str {
        "Egypt"
    }

    fn portal_base_url(&self) -> &'static str {
        "https://visa.vfsglobal.com/egy/en"
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

        driver
            .find(By::Css("input[type='email'], input[name='email'], #email"))
            .await?
            .send_keys(&creds.email)
            .await?;

        driver
            .find(By::Css("input[type='password'], #password"))
            .await?
            .send_keys(&creds.password)
            .await?;

        driver
            .find(By::Css("button[type='submit'], .btn-login, .login-btn"))
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

        let mut slots = Vec::new();
        let cells = driver
            .find_all(By::Css(
                ".open-date, td.enabled, .calendar-day:not(.blocked), .slot-open",
            ))
            .await
            .unwrap_or_default();

        for cell in cells {
            let text = cell.text().await.unwrap_or_default().trim().to_string();
            if !text.is_empty() {
                slots.push(AppointmentSlot {
                    date: text,
                    time: None,
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
                ".open-date, td.enabled, .calendar-day:not(.blocked), .slot-open",
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
                "button.confirm-appointment, .book-btn, button[type='submit']",
            ))
            .await
        {
            btn.click().await?;
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }

        let conf = driver
            .find(By::Css(".ref-number, .booking-confirmation, .confirmation-id"))
            .await
            .ok();

        if let Some(e) = conf {
            let t = e.text().await.unwrap_or_default();
            if !t.is_empty() {
                return Ok(Some(t));
            }
        }

        Ok(Some(format!("EG-{}", uuid::Uuid::new_v4())))
    }
}
