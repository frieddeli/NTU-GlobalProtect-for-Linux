import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const NtuVpnIndicator = GObject.registerClass(
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

    async _isConnected() {
        try {
            let proc = Gio.Subprocess.new(['pgrep', 'openconnect'], Gio.SubprocessFlags.NONE);
            return new Promise((resolve) => {
                proc.wait_async(null, (p, res) => {
                    try {
                        p.wait_finish(res);
                        resolve(p.get_successful());
                    } catch (e) {
                        resolve(false);
                    }
                });
            });
        } catch (e) {
            return false;
        }
    }

    async _updateStatus() {
        const isConnected = await this._isConnected();
        if (isConnected) {
            this._icon.icon_name = 'network-vpn-symbolic';
            this._icon.style = 'color: #33d17a;';
            this._statusItem.label.text = 'NTU VPN: Connected — click to disconnect';
        } else {
            this._icon.icon_name = 'network-vpn-disconnected-symbolic';
            this._icon.style = '';
            this._statusItem.label.text = 'NTU VPN: Disconnected — click to connect';
        }
    }

    async _toggle() {
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

export default class NtuVpnExtension extends Extension {
    enable() {
        this._indicator = new NtuVpnIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
