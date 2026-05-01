#!/bin/bash
set -e

echo "  _   _ _____ _   _  __     ______  _   _ "
echo " | \ | |_   _| | | | \ \   / /  _ \| \ | |"
echo " |  \| | | | | | | |  \ \ / /| |_) |  \| |"
echo " | |\  | | | | |_| |   \ V / |  __/| |\  |"
echo " |_| \_| |_|  \___/     \_/  |_|   |_| \_|"
echo "                                          "
echo "      Unofficial NTU VPN Setup Tool       "
echo "=========================================="

# Detect GNOME version
GNOME_VERSION=$(gnome-shell --version | cut -d' ' -f3 | cut -d'.' -f1)
echo "==> Detected GNOME version: $GNOME_VERSION"

echo "==> Installing dependencies..."
sudo apt update
sudo apt install -y \
    openconnect \
    network-manager-openconnect \
    network-manager-openconnect-gnome \
    pipx \
    libcairo2-dev \
    libgirepository1.0-dev \
    python3-gi \
    python3-gi-cairo \
    gir1.2-gtk-3.0 \
    gir1.2-webkit2-4.1

# Ensure pipx is in PATH for the current session
export PATH="$PATH:$HOME/.local/bin"

echo "==> Installing gp-saml-gui..."
pipx install git+https://github.com/dlenski/gp-saml-gui.git --system-site-packages --force || \
pipx install gp-saml-gui --system-site-packages --force

echo "==> Installing GNOME extension..."
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/ntu-vpn@local"
mkdir -p "$EXT_DIR"

if [ "$GNOME_VERSION" -lt 45 ]; then
    echo "    Using legacy extension format (GNOME < 45)"
    cp gnome-extension/legacy/extension.js "$EXT_DIR/"
    cp gnome-extension/legacy/metadata.json "$EXT_DIR/"
else
    echo "    Using modern extension format (GNOME >= 45)"
    cp gnome-extension/modern/extension.js "$EXT_DIR/"
    cp gnome-extension/modern/metadata.json "$EXT_DIR/"
fi

echo ""
echo "Done! Log out and back in (or restart GNOME Shell), then run:"
echo "  gnome-extensions enable ntu-vpn@local"
echo ""
echo "The NTU VPN icon will appear in your top panel."
