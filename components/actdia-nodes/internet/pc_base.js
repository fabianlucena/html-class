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
      { name: 'eth0', type: 'utpPort', x: -1, y: 0, direction: 'left' },
    ];

    box = {
      x: -1,
      y: -2,
      width: 2,
      height: 4,
    };

    init() {
      super.init(...arguments);
      if (!this.getNetInterface('lo')) {
        this.addInterface({ name: 'lo' });
      }

      if (!this.getNetInterface('eth0')) {
        this.addInterface({ name: 'eth0', connector: this.getConnector('eth0') });
      }
    }
  };
}