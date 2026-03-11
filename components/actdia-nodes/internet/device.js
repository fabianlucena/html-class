import { generateLocalMac } from '../../internet/mac.js';

export default async function create({ actdia, Node, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class Device extends Node {
    static import = [
      './connector-utp-port.js',
    ];

    static fields = [
      {
        name: 'hostname',
        type: 'string',
        label: _f('Hostname')
      },
      {
        name: 'mac',
        type: 'string',
        label: _f('MAC address')
      },
      {
        name: 'ip',
        type: 'string',
        label: _f('IP address')
      },
      {
        name: 'subnet',
        type: 'string',
        label: _f('Subnet mask')
      },
      {
        name: 'gateway',
        type: 'string',
        label: _f('Default gateway')
      },
    ];

    hostname = null;
    mac = null;
    ip = null;
    subnet = null;
    gateway = null;

    init() {
      this.mac ??= generateLocalMac();
      super.init(...arguments);
    }
  };
}