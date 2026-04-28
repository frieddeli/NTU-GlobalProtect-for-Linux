const { GObject, St, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

var NtuVpnIndicator = GObject.registerClass(
class NtuVpnIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'NTU VPN');

        this._icon = new St.Icon({
            icon_name: 'network-vpn-disconnected-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        this._statusItem = new PopupMenu.PopupMenuItem('');
        this._statusItem.connect('activate', () => this._toggle());
        this.menu.addMenuItem(this._statusItem);

        this._updateStatus();
        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
            this._updateStatus();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _isConnected() {
        try {
            const [ok, stdout] = GLib.spawn_command_line_sync('pgrep openconnect');
            return ok && stdout && stdout.length > 0;
        } catch (_) {
            return false;
        }
    }

    _updateStatus() {
        if (this._isConnected()) {
            this._icon.icon_name = 'network-vpn-symbolic';
            this._icon.style = 'color: #33d17a;';
            this._statusItem.label.text = 'NTU VPN: Connected — click to disconnect';
        } else {
            this._icon.icon_name = 'network-vpn-disconnected-symbolic';
            this._icon.style = '';
            this._statusItem.label.text = 'NTU VPN: Disconnected — click to connect';
        }
    }

    _toggle() {
        GLib.spawn_command_line_async(`bash -c "${GLib.get_home_dir()}/.local/bin/ntu-vpn.sh"`);

        let attempts = 0;
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._updateStatus();
            return ++attempts < 15 ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._timer) {
            GLib.source_remove(this._timer);
            this._timer = null;
        }
        super.destroy();
    }
});

let _indicator;

function init() {
}

function enable() {
    _indicator = new NtuVpnIndicator();
    Main.panel.addToStatusArea('ntu-vpn', _indicator);
}

function disable() {
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
}
