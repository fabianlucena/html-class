export default function create({ Node }) {
  return class Unbus extends Node {
    static _label = 'Unbus';

    shape = {
      shape: 'rect',
      x: 0.2,
      y: 0.5,
      width: 0.6,
      height: 2,
      rx: .2,
      ry: .2,
    };

    box = {
      x: 0,
      y: 0.5,
      width: 1,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'o0', type: 'out', x: 1, y: 1, direction: 'right', extends: 'tiny' },
      { name: 'o1', type: 'out', x: 1, y: 2, direction: 'right', extends: 'tiny' },
    ];

    defaultConnector = {
      type: 'out',
      x: 1,
      direction: 'right',
      extends: 'tiny',
    };

    fields = [
      {
        name: 'channelWidth',
        type: 'number',
        min: 1,
        _label: 'Ancho de canal',
      },
    ];

    get channelWidth() {
      return this.connectors.filter(c => c.type === 'out').length;
    }

    set channelWidth(value) {
      const newChannelWidth = this.channelWidth;
      if (value > newChannelWidth) {
        for (let i = newChannelWidth; i < value; i++) {
          this.addConnector();
        }
      } else if (value < newChannelWidth) {
        for (let i = value; i < newChannelWidth; i++) {
          this.removeLastOutput();
        }
      }
    }

    update() {
      const height = Math.max(this.channelWidth, 1);
      this.box.height = height;
      this.shape.height = height;
      super.update();
    }

    getNewConnector(connector) {
      connector ??= {};
      connector.index ??= this.channelWidth;
      connector.type ??= 'out';
      const newConnector = super.getNewConnector(connector);
      newConnector.y ??= newConnector.index + 1;
      newConnector.name ??= `o${newConnector.index}`;
      return newConnector;
    }

    updateStatus(options = {}) {
      this.setStatus(this.connectors.find(c => c.type === 'in')?.status, options);
    }

    propagate(options = {}) {
      this.connectors
        .filter(c => c.type === 'out')
        .forEach((c, i) => c.setStatus(this.status[i], options));
    }
  };
}