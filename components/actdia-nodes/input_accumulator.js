export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class InputAccumulator extends Node {
    static _label = 'Input Accumulator';

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
          dominantBaseline: 'bottom',
          space: 'preserve',
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
      { name: 'input',  type: 'in', x: 0, y: 1, direction: 'left' },
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
      this.shape.children[0].height = value;
      this.shape.children[1].height = value;

      super.setHeight(...arguments);
    }

    #text = '';

    updateStatus() {
      let status = this.#input.received;
      if (Array.isArray(status)) {
        status = status.map(v => v ? v : '');
      }

      this.#text += status;

      this.shape.children[1].text = this.#text;

      this.tryUpdateShape(this.shape.children[1]);
    }
  };
}