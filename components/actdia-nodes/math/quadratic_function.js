export default function create({ Node, _ }) {
  return class QuadraticFunction extends Node {
    static label = _('Quadratic function');
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
          text: 'y = ax^2 + bx + c',
          fontSize: .7,
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
      { name: 'c', type: 'in',  x: 3, y: 2, direction: 'bottom', extends: 'small' },
    ];

    fields = [
      { name: 'a', label: _('a'), type: 'number', value: 1.2, step: 0.01, isTool: true },
      { name: 'b', label: _('b'), type: 'number', value: -5,  step: 0.01, isTool: true },
      { name: 'c', label: _('c'), type: 'number', value:  2,  step: 0.01, isTool: true },
    ];

    #xConnector = null;
    #yConnector = null;
    #aConnector = null;
    #bConnector = null;
    #cConnector = null;
    #a = 1.2;
    #b = -5;
    #c = 2;

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

    get c() {
      return this.#c;
    }

    set c(value) {
      this.setC(value);
    }

    init() {
      super.init(...arguments);
      this.#xConnector = this.getConnector('x');
      this.#yConnector = this.getConnector('y');
      this.#aConnector = this.getConnector('a');
      this.#bConnector = this.getConnector('b');
      this.#cConnector = this.getConnector('c');
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

    setC(value, update = true) {
      this.#c = value;
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
      this.#cConnector = this.getConnector('c');
    }

    updateStatus({ connector }) {
      if (connector === this.#aConnector) {
        this.setA(this.#aConnector.status, false);
      } else if (connector === this.#bConnector) {
        this.setB(this.#bConnector.status, false);
      } else if (connector === this.#cConnector) {
        this.setC(this.#cConnector.status, false);
      }
      
      const
        x = this.#xConnector.status,
        a = this.#a,
        b = this.#b,
        c = this.#c;

      this.setStatus(a * x * x + b * x + c);
    }
  };
}