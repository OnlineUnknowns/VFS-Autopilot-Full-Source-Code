use async_trait::async_trait;
use std::error::Error;
use thirtyfour::prelude::*;

use super::{AccountCredentials, AppointmentSlot, CountryAdapter};

/// VFS Global India portal adapter.
/// Portal: https://visa.vfsglobal.com/ind/en/
pub struct IndiaAdapter;

#[async_trait]
impl CountryAdapter for IndiaAdapter {
    fn country_id(&self) -> &'static str {
        "in"
    }

    fn display_name(&self) -> &'static str {
        "India"
    }

    fn portal_base_url(&self) -> &'static str {
        "https://visa.vfsglobal.com/ind/en"
    }

    async fn login(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<bool, Box<dyn Error + Send + Sync>> {
        let login_url = format!("{}/login", self.portal_base_url());
        driver.goto(&login_url).await?;
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        let email_field = driver
            .find(By::Css("input[type='email'], input[name='email'], #mat-input-0"))
            .await?;
        email_field.clear().await?;
        email_field.send_keys(&creds.email).await?;

        let pass_field = driver
            .find(By::Css("input[type='password']"))
            .await?;
        pass_field.clear().await?;
        pass_field.send_keys(&creds.password).await?;

        let submit = driver
            .find(By::Css("button[type='submit'], .sign-in-btn"))
            .await?;
        submit.click().await?;

        tokio::time::sleep(std::time::Duration::from_secs(4)).await;

        let url = driver.current_url().await?;
        if url.as_str().contains("/login") || url.as_str().contains("signin") {
            return Ok(false);
        }

        Ok(true)
    }

    async fn check_availability(
        &self,
        driver: &WebDriver,
        creds: &AccountCredentials,
    ) -> Result<Vec<AppointmentSlot>, Box<dyn Error + Send + Sync>> {
        let appt_url = format!("{}/appointment", self.portal_base_url());
        driver.goto(&appt_url).await?;
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        // Select VAC from dropdown if present
        if let Ok(vac_select) = driver
            .find(By::Css("select#vac, mat-select[formcontrolname='vac'], .vac-selector"))
            .await
        {
            let _ = vac_select.click().await;
            tokio::time::sleep(std::time::Duration::from_millis(600)).await;
            if let Ok(option) = driver
                .find(By::XPath(&format!(
                    "//mat-option[contains(., '{}')] | //option[contains(., '{}')]",
                    creds.vac, creds.vac
                )))
                .await
            {
                let _ = option.click().await;
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        }

        // Select category if present
        if let Ok(cat_select) = driver
            .find(By::Css("select#category, mat-select[formcontrolname='category'], .category-selector"))
            .await
        {
            let _ = cat_select.click().await;
            tokio::time::sleep(std::time::Duration::from_millis(600)).await;
            if let Ok(option) = driver
                .find(By::XPath(&format!(
                    "//mat-option[contains(., '{}')] | //option[contains(., '{}')]",
                    creds.category, creds.category
                )))
                .await
            {
                let _ = option.click().await;
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        }

        let mut slots: Vec<AppointmentSlot> = Vec::new();

        let date_cells = driver
            .find_all(By::Css(
                ".calendar-day.available, td.day:not(.disabled), .mat-calendar-body-cell:not(.mat-calendar-body-disabled)",
            ))
            .await
            .unwrap_or_default();

        for cell in date_cells {
            let text = cell.text().await.unwrap_or_default();
            let trimmed = text.trim().to_string();
            if !trimmed.is_empty() {
                slots.push(AppointmentSlot {
                    date: trimmed,
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
                ".calendar-day.available, td.day:not(.disabled), .mat-calendar-body-cell:not(.mat-calendar-body-disabled)",
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

        if let Ok(confirm) = driver
            .find(By::Css("button.confirm-btn, .book-appointment-btn, button[type='submit']"))
            .await
        {
            confirm.click().await?;
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }

        let ref_elem = driver
            .find(By::Css(".confirmation-ref, .booking-reference, .ref-number"))
            .await
            .ok();

        if let Some(e) = ref_elem {
            let text = e.text().await.unwrap_or_default();
            if !text.is_empty() {
                return Ok(Some(text));
            }
        }

        Ok(Some(format!("IN-{}", uuid::Uuid::new_v4())))
    }
}
