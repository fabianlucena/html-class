export default function create({ Node, _ }) {
  const windowFunctions = {
    rect: {
      func: (n) => Array(n).fill(1),
      name: _('Rectangular'),
      description: _('Rectangular window: w_i = 1 for all i'),
    },
    bartlett: {
      func: (n) => {
        if (n === 1)
          return [1];

        if (n === 2)
          return [0.5, 0.5];

        const w = [];
        for (let i = 0; i < n; i++) {
          w.push(1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2));
        }
        return w;
      },
      name: _('Bartlett'),
      description: _('Bartlett window: w_i = 1 - |i - (n-1)/2| / ((n-1)/2)'),
    },
    hamming: {
      func: (n) => {
        const w = [];
        const alpha = 0.54;
        const beta = 0.46;
        for (let i = 0; i < n; i++) {
          w.push(alpha - beta * Math.cos(2 * Math.PI * i / (n - 1)));
        }
        return w;
      },
      name: _('Hamming'),
      description: _('Hamming window: w_i = α - β cos(2πi/(n-1))'),
    },
    blackman: {
      func: (n) => {
        const w = [];
        const alpha = 0.16;
        const beta = 0.5;
        const gamma = 0.36;
        for (let i = 0; i < n; i++) {
          w.push(alpha - beta * Math.cos(2 * Math.PI * i / (n - 1)) + gamma * Math.cos(4 * Math.PI * i / (n - 1)));
        }
        return w;
      },
      name: _('Blackman'),
      description: _('Blackman window: w_i = α - β cos(2πi/(n-1)) + γ cos(4πi/(n-1))'),
    },
    blackmanHarris3: {
      func: (n) => {
        const w = [];
        const a0 = 0.42323;
        const a1 = 0.49755;
        const a2 = 0.07922;
        for (let i = 0; i < n; i++) {
          w.push(a0 - a1 * Math.cos(2 * Math.PI * i / (n - 1)) + a2 * Math.cos(4 * Math.PI * i / (n - 1)));
        }
        return w;
      },
      name: _('Blackman-Harris 3-term'),
      description: _('Blackman-Harris 3-term window: w_i = a0 - a1 cos(2πi/(n-1)) + a2 cos(4πi/(n-1))'),
    },
    blackmanHarris: {
      func: (n) => {
        const w = [];
        const a0 = 0.35875;
        const a1 = 0.48829;
        const a2 = 0.14128;
        const a3 = 0.01168;
        for (let i = 0; i < n; i++) {
          w.push(a0 - a1 * Math.cos(2 * Math.PI * i / (n - 1)) + a2 * Math.cos(4 * Math.PI * i / (n - 1)) - a3 * Math.cos(6 * Math.PI * i / (n - 1)));
        }
        return w;
      },
      name: _('Blackman-Harris'),
      description: _('Blackman-Harris window: w_i = a0 - a1 cos(2πi/(n-1)) + a2 cos(4πi/(n-1)) - a3 cos(6πi/(n-1))'),
    },
  };

  return class MovingAverage extends Node {
    static label = 'Moving average';

    rotateCenterX = 2;
    rotateCenterY = 1.5;

    shape = {
      shapes: [
        {
          shape: 'rect',
          y: 0.5,
          width: 5,
          height: 2,
          rx: .2,
          ry: .2,
        }
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 5,
      height: 2,
    };

    connectors = [
      { name: 'i',       label: true, type: 'in', x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: 'clk',     label: true, type: 'in', x: 0, y: 2, direction: 'left',  extends: 'tiny' },
      { name: 'ma',      label: true, type: 'out', x: 5, y: 1, direction: 'right',  extends: 'tiny' },
      { name: 'valueMa', label: '[V, MA]', type: 'out', x: 5, y: 2, direction: 'right',  extends: 'tiny' },
    ];

    fields = [
      {
        name: 'windowWidth',
        _label: 'Window width',
        type: 'number',
        min: 1,
        step: 1,
      },
      {
        name: 'windowFunction',
        type: 'select',
        _label: 'Window function',
        options: Object.entries(windowFunctions)
          .map(([key, info]) => ({
            value: key,
            label: info.name,
            title: info.description,
          })),
      },
    ];

    #windowFunction = 'bartlett';
    #windowFunc = windowFunctions.bartlett.func;
    set windowFunction(funcName) {
      const funcData = windowFunctions[funcName];
      if (funcData) {
        this.#windowFunction = funcName;
        this.#windowFunc = funcData.func;
        this.#window = [];
      }
    }

    get windowFunction() {
      return this.#windowFunction;
    }

    get windowFunc() {
      return this.#windowFunc;
    }

    windowWidth = 10;
    #data = [];
    #window = [];
    #ma = null;
    #valueMa = null;

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#ma = this.connectors.find(c => c.name === 'ma');
        this.#valueMa = this.connectors.find(c => c.name === 'valueMa');
      }
    }

    updateStatusSync() {
      if (!this.inputs.length)
        return;

      const value = this.inputs[0].status;
      this.#data.push(value);
      while (this.#data.length > this.windowWidth) {
        this.#data.shift();
      }

      const n = this.#data.length;
      if (this.#window.length !== n) {
        const window = this.#windowFunc(n);
        const sum = window.reduce((a, b) => a + b, 0);
        this.#window = window.map(w => w / sum);
      }

      const ma = this.#data.reduce((a, b, i) => a + b * this.#window[i], 0);

      this.#ma.setStatus(ma);
      this.#valueMa.setStatus([value, ma]);
    }
  };
}