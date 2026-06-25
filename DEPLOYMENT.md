# Velix Global Visa Booking Automation — License System Deployment

This document covers deployment, configuration, and administration for the Velix license activation and protection system.

---

## 1. System Architecture

The licensing system consists of two parts:
1. **License Server (Backend):** A standalone Express backend using SQLite (`better-sqlite3`) that manages license keys, plans, and device bindings. It is rate-limited and deployed independently.
2. **Desktop Client (Tauri):** Embeds license validation, hashes device GUIDs to lock execution to specific motherboards, and caches active licenses locally using authenticated AES-256-GCM encryption.

---

## 2. License Server Deployment

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Navigate to the `license-server` directory:
   ```bash
   cd license-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Configure the server using the following environment variables:
- `PORT` (Default: `3000`): The port the server listens on.
- `DATA_DIR` (Default: Server root): Absolute path to directory where the SQLite database `license.db` will be written.

### Launching the Server
To run the server in production mode (using PM2, systemd, or raw node):
```bash
# Start server
node server.js
```
The database will be initialized automatically on the first start (creating the `licenses` and `device_bindings` tables, and enabling Write-Ahead Logging (WAL) for concurrent read performance).

### Reverse Proxy & SSL (Recommended)
It is highly recommended to host the server behind a reverse proxy (like Nginx or Caddy) with SSL/TLS termination, since the Tauri client transmits requests over HTTPS.

#### Caddy Example
```caddy
license.velix.app {
    reverse_proxy localhost:3000
}
```

---

## 3. Administrative CLI Commands

We provide three administrative utility scripts located in `license-server/admin/` for remote server administration.

### A. Generate License Key
Generates a cryptographically random license key and saves it to the database.
```bash
node admin/generate-key.js <plan_type> [max_devices] [expires_in_days]
```
- `<plan_type>`: `pro` | `enterprise` | `lifetime`
- `[max_devices]` (Default: `1`): Max concurrent hardware registrations.
- `[expires_in_days]` (Optional): Expiration offset in days. If omitted, license remains active indefinitely (lifetime).

*Example:*
```bash
# Generate a Pro plan license key for 1 device expiring in 30 days
node admin/generate-key.js pro 1 30
```

### B. Revoke License Key
Immediately invalidates a license key. Any desktop client using this key will be blocked upon their next periodic heartbeat check.
```bash
node admin/revoke-key.js <license_key>
```

*Example:*
```bash
node admin/revoke-key.js VLX-8B90-E577-9EAA-3CCF
```

### C. List Licenses & Active Bindings
Lists all active licenses, associated plan levels, expiration dates, and list of registered device hardware fingerprints.
```bash
node admin/list-licenses.js
```

---

## 4. Client-side Desktop Compilation

When building the Tauri desktop application, configure the compile-time server address by specifying the `VELIX_LICENSE_SERVER_URL` environment variable.

### Building on Windows (PowerShell)
```powershell
$env:VELIX_LICENSE_SERVER_URL="https://license.velix.app"
npm run tauri build
```

### Building on macOS/Linux (Bash/Zsh)
```bash
VELIX_LICENSE_SERVER_URL="https://license.velix.app" npm run tauri build
```

If the environment variable is omitted at build time, the client will fall back to `"https://license.velix.app"` as a default.
