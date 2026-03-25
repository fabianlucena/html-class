import createFrame from '../../internet/frame_creator.js';

export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class IPFrameHistory extends Node {
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
          fontFamily: 'monospace',
          textAnchor: 'left',
          textBaseline: 'middle',
          space: 'preserve',
          onClick: args => this.historyClick(args),
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
      { name: 'input',  type: 'utpPort', x: 6, y: 0, direction: 'top' },
      { name: 'output', type: 'utpPort', x: 6, y: 4, direction: 'bottom' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

    #input = null;
    #output = null;
    
    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#output = this.getConnector('output');
    }

    setWidth(value) {
      this.shape.children[0].width = value;
      this.shape.children[1].width = value;

      this.connectors[0].x = value / 2;
      this.connectors[1].x = value / 2;

      super.setWidth(...arguments);
    }

    setHeight(value) {
      const dy = (value % 2) / 2;
      this.shape.y = dy;
      this.box.y = dy;

      this.shape.children[0].height = value;
      this.shape.children[1].height = value;

      this.connectors[0].y = dy;
      this.connectors[1].y = value + dy;

      super.setHeight(...arguments);
    }

    #text = '';
    #history = [];
    #index = -1;

    updateStatus() {
      let status = this.#input.received;
      if (Array.isArray(status)) {
        status = status.map(v => v ? v : 0);
      }

      const frame = createFrame({ raw: status });
      this.#history.push(frame);

      let src = frame.getSrcAddressLabel(),
        dst = frame.getDstAddressLabel(),
        type = frame.getTypeLabel();

      const text = `${type}: ${src} -> ${dst}`;

      this.#text += this.#text ? `\n${text}` : text;

      this.shape.children[1].text = this.#text;

      this.tryUpdateShape(this.shape.children[1]);

      if (this.#index === -1) {
        this.#output.send(status);
      }
    }

    historyClick({ target }) {
      this.#index = Array.from(target.parentElement.children).indexOf(target);
      this.#output.send([...this.#history[this.#index].raw]);
    }
  };
}