#!/bin/bash
VPN_GATEWAY="vpngate-student.ntu.edu.sg"
GP_SAML_GUI="$HOME/.local/bin/gp-saml-gui"

if pgrep openconnect > /dev/null; then
    sudo pkill openconnect
    notify-send "NTU VPN" "Disconnected"
    exit 0
fi

notify-send "NTU VPN" "Opening login window..."

SAML_OUTPUT=$("$GP_SAML_GUI" --gateway "$VPN_GATEWAY" 2>/dev/null)

COOKIE=$(echo "$SAML_OUTPUT" | grep "^COOKIE=" | cut -d= -f2-)
USER=$(echo "$SAML_OUTPUT" | grep "^USER=" | cut -d= -f2-)

if [ -z "$COOKIE" ]; then
    notify-send "NTU VPN" "Authentication failed or cancelled"
    exit 1
fi

notify-send "NTU VPN" "Connecting..."
echo "$COOKIE" | sudo openconnect \
    --protocol=gp \
    --useragent='PAN GlobalProtect' \
    --user="$USER" \
    --os=linux-64 \
    --usergroup=gateway:prelogin-cookie \
    --passwd-on-stdin \
    "$VPN_GATEWAY"
