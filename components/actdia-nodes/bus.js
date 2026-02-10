export default function create({ Node }) {
  return class Bus extends Node {
    static _label = 'Bus';

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
      { name: 'o0', type: 'out', x: 1, y: 1, direction: 'right', extends: 'tiny' },
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'i1', type: 'in', x: 0, y: 2, direction: 'left', extends: 'tiny' },
    ];

    defaultConnector = {
      type: 'in',
      x: 0,
      direction: 'left',
      extends: 'tiny',
    };

    fields = [
      {
        name: 'channelWidth',
        type: 'number',
        min: 1,
        _label: 'Channel width',
      },
    ];

    get channelWidth() {
      return this.connectors.filter(c => c.type === 'in').length;
    }

    set channelWidth(value) {
      const newChannelWidth = this.channelWidth;
      if (value > newChannelWidth) {
        for (let i = newChannelWidth; i < value; i++) {
          this.addConnector();
        }
      } else if (value < newChannelWidth) {
        for (let i = value; i < newChannelWidth; i++) {
          this.removeLastInput();
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
      connector.type ??= 'in';
      const newConnector = super.getNewConnector(connector);
      newConnector.y ??= newConnector.index + 1;
      newConnector.name ??= `i${newConnector.index}`;
      return newConnector;
    }

    updateStatus(options = {}) {
      this.setStatus([...this.connectors.filter(c => c.type === 'in').map(c => c.status)], options);
    }
  };
}