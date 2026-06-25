<div align="center">

<!-- Animated typing headline -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=3B82F6&center=true&vCenter=true&repeat=true&width=700&height=60&lines=🌍+Velix+VFS+Global;Automated+Booking+Engine;Built+with+Rust+%26+Tauri+v1;Smart+Proxy+%26+CAPTCHA+Solving" alt="Velix Typing SVG" />

<!-- Subtitle wave -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=400&size=18&pause=3000&color=94A3B8&center=true&vCenter=true&repeat=true&width=700&height=36&lines=High-performance+native+browser+automation+for+VFS+Global+visa+appointments." alt="Subtitle" />

<br/>

<!-- Core tech badges -->
<img src="https://img.shields.io/badge/Rust-2021_Edition-CE412B?style=for-the-badge&logo=rust&logoColor=white" />
<img src="https://img.shields.io/badge/Tauri-v1.5-FFC107?style=for-the-badge&logo=tauri&logoColor=black" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

<br/>

<!-- Secondary tool badges -->
<img src="https://img.shields.io/badge/SQLite-rusqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/WebDriver-thirtyfour-43B02A?style=for-the-badge&logo=selenium&logoColor=white" />
<img src="https://img.shields.io/badge/Tokio-Async_Runtime-4A154B?style=for-the-badge&logo=rust&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<br/><br/>

<!-- Status badges -->
<img src="https://img.shields.io/badge/status-active-22C55E?style=flat-square" />
<img src="https://img.shields.io/badge/license-Educational%20Use%20Only-F97316?style=flat-square" />
<img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-8B5CF6?style=flat-square" />
<img src="https://img.shields.io/badge/version-0.1.0-F59E0B?style=flat-square" />

</div>

---

## 🧐 About

**Velix** is a high-performance, cross-platform desktop application that automates VFS Global visa appointment booking. The Rust/Tauri backend provides a native browser automation engine with hardened anti-detection, while the React + TypeScript frontend delivers a polished management UI.

> The engine handles randomized scheduling, live CAPTCHA solving, smart proxy cycling, and instant Telegram alerting — all from a single native binary.

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

**🤖 Native Browser Automation**
Built on `thirtyfour` — a fully async Rust WebDriver client that orchestrates Chromium with per-session incognito profiles, spoofed User-Agents, and per-account proxy injection.

**🧩 CAPTCHA Bypass**
Integrates with 2Captcha and Anti-Captcha APIs. The `captcha.rs` module extracts site-keys, submits to the solver, polls for the token, and injects it back into the page automatically.

**🔄 Smart Proxy Engine**
`proxy.rs` maintains a live proxy pool, benchmarks latency in real-time, and hot-swaps connections on failure — keeping each WebDriver session bound to a clean IP.

</td>
<td width="50%">

**📅 Anti-Bot Scheduler**
`scheduler.rs` randomizes check intervals with a **±15 % temporal offset**, producing human-like traffic patterns that resist rate-limiting heuristics.

**🔐 AES-GCM Encrypted Sessions**
`session.rs` serializes, encrypts (AES-256-GCM + HMAC-SHA256), and persists portal cookies to SQLite — so sessions survive restarts without re-logging in.

**📢 Instant Telegram Alerts**
`notifier.rs` dispatches real-time Tauri frontend events and fires Telegram Webhook messages the moment a bookable slot is detected.

</td>
</tr>
</table>

---

## 🌍 Supported Country Adapters

Each country module implements a common booking-step interface, isolating country-specific VFS portal differences.

<div align="center">

| Country | Adapter File | Status |
|:-------:|:------------:|:------:|
| 🇩🇿 Algeria | `countries/algeria.rs` | ✅ Active |
| 🇦🇴 Angola | `countries/angola.rs` | ✅ Active |
| 🇪🇬 Egypt | `countries/egypt.rs` | ✅ Active |
| 🇮🇳 India | `countries/india.rs` | ✅ Active |
| 🇲🇦 Morocco | `countries/morocco.rs` | ✅ Active |
| 🇵🇰 Pakistan | `countries/pakistan.rs` | ✅ Active |

</div>

---

## 🏗️ Project Architecture

```
Velix/
├── 📄 index.html                    # Tauri app entry point
├── 📄 .env.example                  # Environment variable template
│
├── 📂 src/                          # React + TypeScript frontend
│   ├── App.tsx
│   ├── index.css
│   ├── components/                  # Shared UI components
│   ├── pages/                       # Route-level page views
│   ├── store/                       # Zustand global state stores
│   ├── context/                     # React context providers
│   ├── lib/                         # Utility helpers
│   ├── data/                        # Static configuration data
│   └── locales/                     # i18n translation files
│
└── 📂 src-tauri/                    # Rust native backend
    ├── Cargo.toml
    ├── tauri.conf.json
    └── src/
        ├── main.rs                  # Tauri app bootstrap & command registry
        ├── db.rs                    # SQLite schema init & CRUD (accounts, bookings, logs)
        └── engine/
            ├── mod.rs               # Core automation orchestration logic
            ├── browser.rs           # WebDriver capabilities (Incognito, UA, Proxy)
            ├── session.rs           # AES-GCM cookie persist / restore
            ├── scheduler.rs         # Randomized interval scheduling (±15%)
            ├── proxy.rs             # Proxy pool cycling & latency benchmarking
            ├── captcha.rs           # 2Captcha / Anti-Captcha solver integration
            ├── notifier.rs          # Tauri events + Telegram Webhook dispatcher
            └── countries/
                ├── mod.rs           # Country adapter trait & registry
                ├── algeria.rs
                ├── angola.rs
                ├── egypt.rs
                ├── india.rs
                ├── morocco.rs
                └── pakistan.rs
```

---

## 🛠️ Prerequisites

### 1 · ChromeDriver

The backend communicates with a locally-running ChromeDriver process. Install the version that **exactly matches** your Chrome installation.

**Windows — Chocolatey**
```powershell
choco install chromedriver
```

**macOS — Homebrew**
```bash
brew install --cask chromedriver
```

**Linux — apt**
```bash
sudo apt install chromium-driver
```

**Manual** → [Chrome for Testing releases](https://googlechromelabs.github.io/chrome-for-testing/)

---

### 2 · Start ChromeDriver

Launch the service before starting Velix. It must listen on `127.0.0.1:9515` (the default port wired in `browser.rs`):

```bash
chromedriver --port=9515 --allowed-ips=127.0.0.1
```

---

### 3 · Environment Variables

Copy `.env.example` → `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Third-party CAPTCHA solver (2Captcha / Anti-Captcha)
VITE_CAPTCHA_API_KEY=your_api_key_here

# Telegram alerting
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## 🚀 Running Locally

### Frontend + Backend (full app)

```bash
# Install frontend dependencies
npm install

# Launch Tauri dev mode (starts Vite + Rust backend)
npm run tauri dev
```

### Rust backend only (no GUI)

```bash
cd src-tauri

# Static analysis — no compilation
cargo check

# Full compilation
cargo build

# Build optimised release binary
cargo build --release
```

---

## 🔐 Security Model

| Concern | Approach |
|:--------|:---------|
| Credential Storage | SQLite rows encrypted with **AES-256-GCM** keyed per-installation |
| Session Cookies | Serialized, HMAC-SHA256 signed, AES-GCM encrypted at rest |
| Proxy Auth | Injected at WebDriver capability level — never sent to the UI layer |
| Environment Secrets | Loaded from `.env` at build time via Vite — excluded from version control |

---

## 📦 Tech Stack

<div align="center">

| Layer | Technology |
|:------|:-----------|
| Desktop Shell | Tauri 1.5 |
| Backend Language | Rust 2021 Edition |
| Async Runtime | Tokio (full features) |
| Browser Automation | thirtyfour 0.31 (WebDriver) |
| Database | SQLite via rusqlite 0.29 (bundled) |
| Encryption | aes-gcm 0.10 + hmac 0.12 + sha2 0.10 |
| HTTP Client | reqwest 0.11 |
| Frontend Framework | React 18 + TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| State Management | Zustand 4.4 |
| Form Validation | React Hook Form + Zod |
| Build Tool | Vite 5 |

</div>

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a clear message
   ```bash
   git commit -m "feat: describe your change"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request — describe what changed and why

> Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📝 License

This project is published under an **Educational Use Only** license.
The source code is shared **for learning purposes only** — commercial use, redistribution, and production deployment are strictly prohibited.

See [`LICENSE`](LICENSE) for the full terms.

---

## 👤 Author

<div align="center">

<a href="https://github.com/OnlineUnknowns">
  <img src="https://img.shields.io/badge/GitHub-OnlineUnknowns-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile" />
</a>
&nbsp;
<a href="https://wa.me/201286016083">
  <img src="https://img.shields.io/badge/WhatsApp-Chat%20with%20me-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp" />
</a>

</div>

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&pause=2000&color=475569&center=true&vCenter=true&width=600&lines=Built+with+%E2%9D%A4%EF%B8%8F+in+Rust+%26+TypeScript;Shared+for+Educational+Purposes+Only;%C2%A9+2025+OnlineUnknowns" alt="Footer" />

<br/><br/>

<a href="https://github.com/OnlineUnknowns"><img src="https://img.shields.io/github/followers/OnlineUnknowns?label=Follow%20on%20GitHub&style=social" alt="GitHub followers" /></a>

</div>
