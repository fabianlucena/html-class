export default function create({ Node, _ }) {
  const errorFunctions = {
    mse: {
      func: (e, r) => { let d = e - r; return d * d / 2.0; },
      derivative: (e, r) => (e - r),
      name: _('MSE'),
      description: _('Mean Squared Error: E = (1/n) Σ (y_i - r_i)^2'),
    },
    absDiff: {
      func: (e, r) => Math.abs(e - r),
      derivative: (e, r) => (e > r ? 1 : e < r ? -1 : 0),
      name: _('Diff'),
      description: _('Absolute difference: E = (1/n) Σ |y_i - r_i|'),
    },
  };

  return class Cost extends Node {
    shape = {
      shapes: [
        {
          shape: 'circle',
          x: 1,
          y: 1,
          r: 1,
        },
        {
          shape: 'path',
          d: `M 1,1.5
            L 1,0.5
            M 0.6,0.5
            L 1.4,0.5
            M 0.6,0.5
            L 0.4,1.1
            L 0.8,1.1
            Z
            M 1.4,0.5
            L 1.2,1.1
            L 1.6,1.1
            Z
            M 0.9,1.5
            L 1.1,1.5
            L 1.1,1.6
            L 0.9,1.6
            Z`
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in',  x: 0.293, y: 0.293, direction:  135,  extends: 'tiny' },
      { name: 'i1', type: 'in',  x: 0.293, y: 1.707, direction: -135,  extends: 'tiny' },
      { name: 'o0', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    #inputs = [];
    #func = errorFunctions.mse.func;
    #derivative = errorFunctions.mse.derivative;

    get inputs() {
      return this.#inputs;
    }

    get func() {
      return this.#func;
    }

    get derivative() {
      return this.#derivative;
    }

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#inputs = this.connectors.filter(c => c.type === 'in');
      }
    }

    updateStatus(options = {}) {
      const inputs = this.#inputs.map(i => i.status);
      let status = this.func(inputs[1], inputs[0]);

      this.setStatus(status, options);
    }
  };
}