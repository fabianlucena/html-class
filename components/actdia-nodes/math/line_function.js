export default function create({ Node, _ }) {
  return class LineFunction extends Node {
    static _ = _('Line function');
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 6,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 3,
          y: 1,
          text: 'y = ax + b',
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 6,
      height: 2,
    };

    connectors = [
      { name: 'x', type: 'in',  x: 0, y: 1, direction: 'left',   extends: 'small' },
      { name: 'y', type: 'out', x: 6, y: 1, direction: 'right',  extends: 'small' },
      { name: 'a', type: 'in',  x: 1, y: 2, direction: 'bottom', extends: 'small' },
      { name: 'b', type: 'in',  x: 2, y: 2, direction: 'bottom', extends: 'small' },
    ];

    fields = [
      { name: 'a', label: _('a'), type: 'number', value: .25, step: 0.01, isTool: true },
      { name: 'b', label: _('b'), type: 'number', value:  2,  step: 0.01, isTool: true },
    ];

    #xConnector = null;
    #yConnector = null;
    #aConnector = null;
    #bConnector = null;
    #a = .25;
    #b = 2;

    get a() {
      return this.#a;
    }

    set a(value) {
      this.setA(value);
    }

    get b() {
      return this.#b;
    }

    set b(value) {
      this.setB(value);
    }

    init() {
      super.init(...arguments);
      this.#xConnector = this.getConnector('x');
      this.#yConnector = this.getConnector('y');
      this.#aConnector = this.getConnector('a');
      this.#bConnector = this.getConnector('b');
    }

    setA(value, update = true) {
      this.#a = value;
      if (update) {
        this.updateStatus();
      }
    }

    setB(value, update = true) {
      this.#b = value;
      if (update) {
        this.updateStatus();
      }
    }

    init() {
      super.init(...arguments);
      this.#xConnector = this.getConnector('x');
      this.#yConnector = this.getConnector('y');
      this.#aConnector = this.getConnector('a');
      this.#bConnector = this.getConnector('b');
    }

    updateStatus({ connector }) {
      if (connector === this.#aConnector) {
        this.setA(this.#aConnector.status, false);
      } else if (connector === this.#bConnector) {
        this.setB(this.#bConnector.status, false);
      }
      
      const
        x = this.#xConnector.status,
        a = this.#a,
        b = this.#b;

      this.setStatus(a * x + b);
    }
  };
}