import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const VPN_GATEWAY = 'vpngate-student.ntu.edu.sg';

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
        const isConnected = await this._isConnected();

        if (isConnected) {
            // Disconnect logic
            try {
                let proc = Gio.Subprocess.new(['pkexec', 'pkill', 'openconnect'], Gio.SubprocessFlags.NONE);
                proc.wait_async(null, (p, res) => {
                    p.wait_finish(res);
                    Main.notify('NTU VPN', 'Disconnected');
                    this._updateStatus();
                });
            } catch (e) {
                console.error(e);
            }
        } else {
            // Connect logic
            Main.notify('NTU VPN', 'Opening login window...');
            
            try {
                let samlProc = Gio.Subprocess.new(
                    ['gp-saml-gui', '--gateway', VPN_GATEWAY],
                    Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                );

                samlProc.communicate_utf8_async(null, null, (p, res) => {
                    try {
                        let [, stdout, stderr] = p.communicate_utf8_finish(res);
                        if (!p.get_successful()) {
                            Main.notify('NTU VPN', 'Authentication failed or cancelled');
                            return;
                        }

                        // Parse COOKIE and USER from output
                        let cookie = stdout.match(/^COOKIE=(.*)$/m)?.[1];
                        let user = stdout.match(/^USER=(.*)$/m)?.[1];

                        if (!cookie) {
                            Main.notify('NTU VPN', 'Failed to acquire auth cookie');
                            return;
                        }

                        Main.notify('NTU VPN', 'Connecting...');

                        // Start openconnect via pkexec
                        // We use a shell wrapper to pipe the cookie to stdin safely
                        let ocCmd = [
                            'pkexec', 'sh', '-c',
                            `echo "${cookie}" | openconnect --protocol=gp --useragent='PAN GlobalProtect' --user="${user}" --os=linux-64 --usergroup=gateway:prelogin-cookie --passwd-on-stdin ${VPN_GATEWAY}`
                        ];

                        let ocProc = Gio.Subprocess.new(ocCmd, Gio.SubprocessFlags.NONE);
                        ocProc.wait_async(null, (p, res) => {
                            p.wait_finish(res);
                            this._updateStatus();
                        });

                    } catch (e) {
                        Main.notify('NTU VPN', 'Error: ' + e.message);
                    }
                });
            } catch (e) {
                Main.notify('NTU VPN', 'Failed to start login tool');
            }
        }
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
