export default async function create({ actdia, Node, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class TAP extends Node {
    static _label = _f('TAP');
    static _description = _f('TAP node');
    static import = [
      './connector-utp-port.js',
    ];

    shape = {
      children: [
        {
          shape: 'rect',
          x: -1,
          y: -1,
          width: 2,
          height: 2,
        },
        {
          shape: 'text',
          x: 0,
          y: 0,
          text: 'TAP',
        },
      ],
    };

    box = {
      x: -1,
      y: -1,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'a', type: 'utpPort', x: -1, y: 0, direction: 'left', onRecv: params => this.onRecv(params) },
      { name: 'b', type: 'utpPort', x: 1, y: 0, direction: 'right', onRecv: params => this.onRecv(params) },
      { name: 'monitor', type: 'utpPort', x: 0, y: 1, direction: 'bottom', onRecv: params => this.onRecv(params) },
    ];

    #AConnector = null;
    #BConnector = null;
    #monitorConnectos = null;

    init() {
      super.init(...arguments);

      this.#AConnector = this.getConnector('a');
      this.#BConnector = this.getConnector('b');
      this.#monitorConnectos = this.getConnector('monitor');
    }

    onRecv({ connector, data }) {
      if (connector === this.#AConnector) {
        this.#monitorConnectos.send(data);
        this.#BConnector.send(data);
      } else if (connector === this.#BConnector) {
        this.#monitorConnectos.send(data);
        this.#AConnector.send(data);
      }
    }
  }
}