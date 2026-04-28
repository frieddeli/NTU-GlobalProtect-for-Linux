# 🛡️ Unofficial NTU GlobalProtect VPN Setup for Linux

![Ubuntu Version](https://img.shields.io/badge/Ubuntu-22.04%20%7C%2024.04%20%7C%2026.04-orange?logo=ubuntu)
![GNOME Version](https://img.shields.io/badge/GNOME-40%20--%2050+-blue?logo=gnome)
![License](https://img.shields.io/badge/License-MIT-green)

> [!CAUTION]
> **DISCLAIMER:** This is an unofficial community tool. It is **NOT** affiliated with, endorsed by, or supported by Nanyang Technological University (NTU). Use this script at your own risk. The author is not responsible for network issues, account locks, or system damages.

A seamless GlobalProtect VPN client for NTU students and staff. It combines `openconnect` for stable tunneling, `gp-saml-gui` for Microsoft SSO support, and a sleek GNOME Shell indicator for easy toggling.

---

## 🚀 Motivation

While an official GlobalProtect client exists, it often lags behind modern Linux releases.

* **Ubuntu 26.04 Support:** The official client does not currently support newer releases like 26.04.
* **Modern Dependencies:** Avoids the headache of hunting down outdated libraries required by the official binary.
* **Native Integration:** Provides a native GNOME Shell icon, so you don't have to keep a terminal open or use a clunky UI.

---

## 📋 Requirements

* **OS:** Ubuntu 22.04 LTS, 24.04 LTS, or 26.04+
* **Desktop:** GNOME Shell 40 through 50+
* **Account:** Active NTU student/staff credentials

---

## 🛠️ Quick Install

1. **Clone and Run:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ntu-vpn-setup.git
   cd ntu-vpn-setup
   chmod +x install.sh
   ./install.sh
   ```
2. **Activate:**
   Log out and back in (or restart GNOME Shell), then enable the extension:

   ```bash
   gnome-extensions enable ntu-vpn@local
   ```

---

## 💡 Usage

### 🖱️ GNOME Indicator

Click the VPN icon in your top panel:

* **⚪ Grey Icon:** Disconnected. Click to open the Microsoft SSO login window.
* **🟢 Green Icon:** Connected. Click to disconnect instantly.

### 💻 Terminal

You can also toggle the connection manually:

```bash
ntu-vpn.sh
```

---

## 🔍 How It Works

1. **Authentication:** `gp-saml-gui` launches a secure web view to handle the Microsoft SAML login.
2. **Connection:** Once authenticated, the session cookie is passed to `openconnect` using the GlobalProtect protocol.
3. **Persistence:** A background polling mechanism (every 5s) keeps the top panel icon in sync with your actual connection state.

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information.
