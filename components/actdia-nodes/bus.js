export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

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
        name: 'channels',
        type: 'number',
        min: 1,
        _label: 'Channels',
        isTool: true,
      },
    ];

    get channels() {
      return this.connectors.filter(c => c.isInput).length;
    }

    set channels(value) {
      this.setChannels(value);
    }

    setChannels(value, update = true) {
      let needUpdate = false;
      const currentChannels = this.channels;
      if (value > currentChannels) {
        needUpdate = true;
        for (let i = currentChannels; i < value; i++) {
          this.addConnector(null, false);
        }
      } else if (value < currentChannels) {
        needUpdate = true;
        for (let i = value; i < currentChannels; i++) {
          this.removeLastInput(false);
        }
      }

      needUpdate && update && this.update();
    }

    update() {
      if (this.isInitializing)
        return;
      
      const height = Math.max(this.channels, 1);
      this.box.height = height;
      this.shape.height = height;
      super.update();
    }

    getNewConnector(connector) {
      connector ??= {};
      connector.index ??= this.channels;
      connector.type ??= 'in';
      const newConnector = super.getNewConnector(connector);
      newConnector.y ??= newConnector.index + 1;
      newConnector.name ??= `i${newConnector.index}`;
      return newConnector;
    }

    updateStatus(options = {}) {
      this.setStatus([...this.inputs.map(c => c.received)], options);
    }

    statusUpdated(options = {}) {
      this.outputs.forEach(c => c.send(this.status));
    }
  };
}