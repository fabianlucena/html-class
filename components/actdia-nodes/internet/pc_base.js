export default async function create({ actdia }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { NetworkDevice } = await actdia.getElementsClassOrImportForMeta('network_device.js', import.meta);

  return class PCBase extends NetworkDevice {
    shape = {
      children: [
        {
          shape: 'rect',
          x: -1,
          y: -2,
          width: 2,
          height: 4,
        },
        {
          shape: 'rect',
          x: -.6,
          y: -1.6,
          width: 1.2,
          height: .5,
        },
      ],
    };

    connectors = [
      { name: 'enp3s0', type: 'utpPort', x: -1, y: 0, direction: 'left' },
    ];

    box = {
      x: -1,
      y: -2,
      width: 2,
      height: 4,
    };

    init() {
      super.init(...arguments);
      this.netInterfaces = [];

      if (!this.getNetInterface('lo')) {
        this.addNetInterface({ name: 'lo', link: 'loopback' });
      }

      if (!this.getNetInterface('enp3s0')) {
        let enp3s0 = this.addNetInterface({ name: 'enp3s0', connector: this.getConnector('enp3s0') });
        this.addIPAddress(enp3s0, '192.168.0.15/24');
        this.addIPAddress(enp3s0, 'fe80::3e97:eff:fe12:abcd/64');
      }
    }
  };
}