use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Account {
  pub id: String,
  pub email: String,
  pub password_encrypted: String,
  pub vac: String,
  pub category: String,
  pub country_id: String,
  pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Booking {
  pub id: String,
  pub account_id: String,
  pub country_id: String,
  pub vac: String,
  pub status: String, // "Searching", "Found", "Booked", "Failed"
  pub date_found: String,
  pub booking_date: String,
  pub confirmation_details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityLog {
  pub id: String,
  pub log_type: String, // "success", "error", "info"
  pub channel: String,  // "desktop", "telegram", "sound"
  pub message: String,
  pub timestamp: String,
}

pub struct DbState {
  pub conn_path: String,
}

impl DbState {
  pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
    let path_str = path.as_ref().to_string_lossy().to_string();
    let conn = Connection::open(&path_str)?;
    
    // Create tables if they do not exist
    conn.execute(
      "CREATE TABLE IF NOT EXISTS accounts (
         id TEXT PRIMARY KEY,
         email TEXT NOT NULL UNIQUE,
         password_encrypted TEXT NOT NULL,
         vac TEXT NOT NULL,
         category TEXT NOT NULL,
         country_id TEXT NOT NULL,
         is_active INTEGER DEFAULT 1
       )",
      [],
    )?;

    conn.execute(
      "CREATE TABLE IF NOT EXISTS bookings (
         id TEXT PRIMARY KEY,
         account_id TEXT NOT NULL,
         country_id TEXT NOT NULL,
         vac TEXT NOT NULL,
         status TEXT NOT NULL,
         date_found TEXT NOT NULL,
         booking_date TEXT NOT NULL,
         confirmation_details TEXT,
         FOREIGN KEY(account_id) REFERENCES accounts(id)
       )",
      [],
    )?;

    conn.execute(
      "CREATE TABLE IF NOT EXISTS activity_log (
         id TEXT PRIMARY KEY,
         log_type TEXT NOT NULL,
         channel TEXT NOT NULL,
         message TEXT NOT NULL,
         timestamp TEXT NOT NULL
       )",
      [],
    )?;

    Ok(Self { conn_path: path_str })
  }

  fn get_connection(&self) -> Result<Connection> {
    Connection::open(&self.conn_path)
  }

  // --- Accounts CRUD operations ---

  pub fn get_accounts(&self) -> Result<Vec<Account>> {
    let conn = self.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, email, password_encrypted, vac, category, country_id, is_active FROM accounts")?;
    let account_iter = stmt.query_map([], |row| {
      Ok(Account {
        id: row.get(0)?,
        email: row.get(1)?,
        password_encrypted: row.get(2)?,
        vac: row.get(3)?,
        category: row.get(4)?,
        country_id: row.get(5)?,
        is_active: row.get::<_, i32>(6)? == 1,
      })
    })?;

    let mut list = Vec::new();
    for acc in account_iter {
      list.push(acc?);
    }
    Ok(list)
  }

  pub fn save_account(&self, acc: &Account) -> Result<()> {
    let conn = self.get_connection()?;
    conn.execute(
      "INSERT OR REPLACE INTO accounts (id, email, password_encrypted, vac, category, country_id, is_active)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      params![
        acc.id,
        acc.email,
        acc.password_encrypted,
        acc.vac,
        acc.category,
        acc.country_id,
        if acc.is_active { 1 } else { 0 }
      ],
    )?;
    Ok(())
  }

  pub fn update_account_status(&self, id: &str, is_active: bool) -> Result<()> {
    let conn = self.get_connection()?;
    conn.execute(
      "UPDATE accounts SET is_active = ?1 WHERE id = ?2",
      params![if is_active { 1 } else { 0 }, id],
    )?;
    Ok(())
  }

  pub fn delete_account(&self, id: &str) -> Result<()> {
    let conn = self.get_connection()?;
    conn.execute("DELETE FROM accounts WHERE id = ?", params![id])?;
    Ok(())
  }

  // --- Bookings CRUD operations ---

  pub fn get_bookings(&self) -> Result<Vec<Booking>> {
    let conn = self.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, account_id, country_id, vac, status, date_found, booking_date, confirmation_details FROM bookings")?;
    let booking_iter = stmt.query_map([], |row| {
      Ok(Booking {
        id: row.get(0)?,
        account_id: row.get(1)?,
        country_id: row.get(2)?,
        vac: row.get(3)?,
        status: row.get(4)?,
        date_found: row.get(5)?,
        booking_date: row.get(6)?,
        confirmation_details: row.get(7)?,
      })
    })?;

    let mut list = Vec::new();
    for b in booking_iter {
      list.push(b?);
    }
    Ok(list)
  }

  pub fn save_booking(&self, b: &Booking) -> Result<()> {
    let conn = self.get_connection()?;
    conn.execute(
      "INSERT OR REPLACE INTO bookings (id, account_id, country_id, vac, status, date_found, booking_date, confirmation_details)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
      params![
        b.id,
        b.account_id,
        b.country_id,
        b.vac,
        b.status,
        b.date_found,
        b.booking_date,
        b.confirmation_details
      ],
    )?;
    Ok(())
  }

  // --- Activity Log operations ---

  pub fn get_logs(&self) -> Result<Vec<ActivityLog>> {
    let conn = self.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, log_type, channel, message, timestamp FROM activity_log ORDER BY timestamp DESC LIMIT 100")?;
    let log_iter = stmt.query_map([], |row| {
      Ok(ActivityLog {
        id: row.get(0)?,
        log_type: row.get(1)?,
        channel: row.get(2)?,
        message: row.get(3)?,
        timestamp: row.get(4)?,
      })
    })?;

    let mut list = Vec::new();
    for l in log_iter {
      list.push(l?);
    }
    Ok(list)
  }

  pub fn add_log(&self, log: &ActivityLog) -> Result<()> {
    let conn = self.get_connection()?;
    conn.execute(
      "INSERT INTO activity_log (id, log_type, channel, message, timestamp)
       VALUES (?1, ?2, ?3, ?4, ?5)",
      params![log.id, log.log_type, log.channel, log.message, log.timestamp],
    )?;
    Ok(())
  }
}
