export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class IPViewer extends Node {
    static import = [
      './connector-utp-port.js',
    ];

    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 12,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 12,
          height: 4,
          text: '',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 12,
      height: 4,
    };

    connectors = [
      { name: 'input', type: 'utpPort', x: 0, y: 2, direction: 'left', extends: 'small' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

    #input = null;
    
    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
    }

    setWidth(value) {
      this.shape.children[0].width = value;
      this.shape.children[1].width = value;
      super.setWidth(...arguments);
    }

    setHeight(value) {
      const dy = (value % 2) / 2;
      this.shape.y = dy;
      this.box.y = dy;

      this.shape.children[0].height = value;
      this.shape.children[1].height = value;
      this.connectors[0].y = value / 2 + dy;

      super.setHeight(...arguments);
    }

    updateStatus() {
      let status = this.#input.received;
      if (Array.isArray(status)) {
        status = status.map(v => v ? v : 0);
      }

      if (Array.isArray(status)) {
        this.shape.children[1].text = JSON.stringify(status);
      } else {
        this.shape.children[1].text = JSON.stringify(status, null, ' ');
      }

      this.tryUpdateShape(this.shape.children[1]);
    }
  };
}