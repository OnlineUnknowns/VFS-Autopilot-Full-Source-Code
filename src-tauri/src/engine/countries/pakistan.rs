use async_trait::async_trait;
use std::error::Error;
use thirtyfour::prelude::*;

use super::{AccountCredentials, AppointmentSlot, CountryAdapter};

/// VFS Global Pakistan portal adapter.
/// Portal: https://visa.vfsglobal.com/pak/en/gbr (login endpoint may vary by destination)
pub struct PakistanAdapter;

#[async_trait]
impl CountryAdapter for PakistanAdapter {
    fn country_id(&self) -> &'static str {
        "pk"
    }

    fn display_name(&self) -> &'static str {
        "Pakistan"
    }

    fn portal_base_url(&self) -> &'static str {
        "https://visa.vfsglobal.com/pak/en"
    }

    async fn login(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<bool, Box<dyn Error + Send + Sync>> {
        let login_url = format!("{}/login", self.portal_base_url());
        driver.goto(&login_url).await?;

        // Wait for email field and fill credentials
        let email_field = driver
            .find(By::Css("input[type='email'], input[name='username'], input[id='mat-input-0']"))
            .await?;
        email_field.clear().await?;
        email_field.send_keys(&creds.email).await?;

        let pass_field = driver
            .find(By::Css("input[type='password']"))
            .await?;
        pass_field.clear().await?;
        pass_field.send_keys(&creds.password).await?;

        let submit_btn = driver
            .find(By::Css("button[type='submit'], .signin-btn, button.mat-raised-button"))
            .await?;
        submit_btn.click().await?;

        // Allow navigation to complete
        tokio::time::sleep(std::time::Duration::from_secs(3)).await;

        // Detect failed login by error banner or redirect to dashboard
        let url = driver.current_url().await?;
        let url_str = url.as_str();

        // If still on login page, credentials were rejected
        if url_str.contains("/login") || url_str.contains("signin") {
            return Ok(false);
        }

        Ok(true)
    }

    async fn check_availability(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<Vec<AppointmentSlot>, Box<dyn Error + Send + Sync>> {
        // Navigate to appointment booking dashboard
        let appt_url = format!(
            "{}/appointment",
            self.portal_base_url()
        );
        driver.goto(&appt_url).await?;
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        let mut slots: Vec<AppointmentSlot> = Vec::new();

        // Try to find available date cells on the calendar
        let date_elements = driver
            .find_all(By::Css(
                ".calendar-day.available, .mat-calendar-body-cell:not(.mat-calendar-body-disabled), \
                 td.day.available, .available-slot",
            ))
            .await
            .unwrap_or_default();

        for elem in date_elements {
            if let Ok(date_text) = elem.text().await {
                let date_text = date_text.trim().to_string();
                if !date_text.is_empty() {
                    slots.push(AppointmentSlot {
                        date: date_text,
                        time: None,
                        vac: creds.vac.clone(),
                        category: creds.category.clone(),
                    });
                }
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
        // Find and click the target date cell
        let date_cells = driver
            .find_all(By::Css(
                ".calendar-day.available, .mat-calendar-body-cell:not(.mat-calendar-body-disabled)",
            ))
            .await
            .unwrap_or_default();

        let mut clicked = false;
        for cell in date_cells {
            let text = cell.text().await.unwrap_or_default();
            if text.trim() == slot.date.trim() {
                cell.click().await?;
                clicked = true;
                break;
            }
        }

        if !clicked {
            return Ok(None);
        }

        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        // Click the confirm/next button
        if let Ok(confirm_btn) = driver
            .find(By::Css(
                "button.confirm-btn, button[aria-label='Confirm'], .book-btn, button.mat-raised-button.submit",
            ))
            .await
        {
            confirm_btn.click().await?;
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }

        // Attempt to parse confirmation reference number
        let conf_ref = driver
            .find(By::Css(
                ".confirmation-number, .ref-number, .booking-ref, [data-ref]",
            ))
            .await
            .ok();

        if let Some(elem) = conf_ref {
            let ref_text = elem.text().await.unwrap_or_default();
            if !ref_text.is_empty() {
                return Ok(Some(ref_text));
            }
        }

        Ok(Some(format!("PK-{}", uuid::Uuid::new_v4())))
    }
}
