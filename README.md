# 🛡️ Unofficial NTU GlobalProtect VPN GUI for Linux

![Ubuntu Version](https://img.shields.io/badge/Ubuntu-22.04%20%7C%2024.04%20%7C%2026.04-orange?logo=ubuntu)
![GNOME Version](https://img.shields.io/badge/GNOME-40%20--%2050+-blue?logo=gnome)
![License](https://img.shields.io/badge/License-MIT-green)

> [!CAUTION]
> **DISCLAIMER:** This is an unofficial community tool. It is **NOT** affiliated with, endorsed by, or supported by Nanyang Technological University (NTU). Use this script at your own risk.

A seamless GlobalProtect VPN client for NTU students and staff. It combines `openconnect` for stable tunneling, `gp-saml-gui` for Microsoft SSO support, and a sleek GNOME Shell indicator for easy toggling.

Great for those who wish to switch to daily driving linux !

---

## 🚀 Motivation

While an official GlobalProtect client exists, it often lags behind modern Linux releases.

* **Ubuntu 26.04 Support:** The official client does not currently support newer releases like 26.04.
* **Modern Dependencies:** Avoids the headache of hunting down outdated libraries required by the official binary.
* **Native Integration:** Provides a native GNOME Shell icon and uses system PolicyKit for secure, integrated password prompts.
* **Non-Blocking UI:** Uses fully asynchronous processing to ensure your desktop never freezes during connection transitions.

---

## 📋 Requirements

* **OS:** Ubuntu 22.04 LTS, 24.04 LTS, or 26.04+
* **Desktop:** GNOME Shell 40 through 50+
* **Account:** Active NTU student/staff credentials

---

## 🛠️ Quick Install

1. **Clone and Run:**

   ```bash
   git clone https://github.com/frieddeli/NTU-GlobalProtect-for-Linux.git
   cd NTU-GlobalProtect-for-Linux
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

The extension uses native system notifications to keep you updated on the connection status. When connecting, you will be prompted for your system password via the standard GNOME security popup to authorize the VPN tunnel.

---

## 🔍 How It Works

1. **Authentication:** The extension launches `gp-saml-gui` in the background to handle the Microsoft SAML login via a secure web view.
2. **Seamless Hand-off:** Once authenticated, the extension internally captures the session cookie and securely passes it to `openconnect`.
3. **Integrated Permissions:** Uses `pkexec` (PolicyKit) for privilege escalation, removing the need for manual `sudo` configuration or insecure password-less sudo rules.
4. **Asynchronous Monitoring:** A background event loop monitors the connection state without blocking the GNOME Shell UI thread, ensuring a smooth desktop experience even on resume from sleep.

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information.
