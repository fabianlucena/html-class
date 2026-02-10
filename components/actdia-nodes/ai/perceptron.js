export default function create({ Node, _ }) {
  const activationFunctions = {
    relu: {
      func: x => Math.max(0, x),
      derived: x => (x > 0 ? 1 : 0),
      name: _('ReLU'),
      description: _('Rectified Linear Unit: f(x) = x for x > 0, else 0'),
    },
    sigmoid: {
      func: x => 1 / (1 + Math.exp(-x)),
      derived: x => x * (1 - x),
      name: _('Sigmoid'),
      description: _('Sigmoid function: f(x) = 1 / (1 + e^(-x))'),
    },
    tanh: {
      func: x => (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)),
      derived: x => 1 - x * x,
      name: _('Tanh'),
      description: _('Hyperbolic Tangent: f(x) = (e^x - e^(-x)) / (e^x + e^(-x))'),
    },
    identity: {
      func: x => x,
      derived: x => 1,
      name: _('Identity'),
      description: _('Identity function: f(x) = x'),
    },
    step: {
      func: x => x >= 0 ? 1 : 0,
      derived: x => 0,
      name: _('Step'),
      description: _('Step function: f(x) = 1 for x >= 0, else 0'),
    },
    softmax: {
      func: x => Math.exp(x) / Math.sum(Math.exp(x)),
      derived: x => x * (1 - x),
      name: _('Softmax'),
      description: _('Softmax function: f(x) = e^(x_i) / Σ e^(x_j) for all j'),
    },
    clamped: {
      func: x => x < 0 ? 0 : x > 1 ? 1 : x,
      derived: x => (x >= 0 && x <= 1) ? 1 : 0,
      name: _('Clamped'),
      description: _('Clamped function: f(x) = 0 for x < 0, f(x) = 1 for x > 1, else f(x) = x'),
    },
    clampedSymmetric: {
      func: x => Math.max(-1, Math.min(1, x)),
      derived: x => (x > -1 && x < 1) ? 1 : 0,
      name: _('Clamped Symmetric'),
      description: _('Clamped Symmetric function: f(x) = -1 for x < -1, f(x) = 1 for x > 1, else f(x) = x'),
    },
    leakyReLU: {
      func: x => x > 0 ? x : 0.01 * x,
      derived: x => (x > 0 ? 1 : 0.01),
      name: _('Leaky ReLU'),
      description: _('Leaky Rectified Linear Unit: f(x) = x for x > 0, else 0.01 * x'),
    },
    elu: {
      func: x => x >= 0 ? x : (Math.exp(x) - 1),
      derived: x => (x >= 0 ? 1 : Math.exp(x)),
      name: _('ELU'),
      description: _('Exponential Linear Unit: f(x) = x for x >= 0, else e^x - 1'),
    },
    selu: {
      func: x => x >= 0 ? 1.0507 * x : 1.0507 * (Math.exp(x) - 1),
      derived: x => (x >= 0 ? 1.0507 : 1.0507 * Math.exp(x)),
      name: _('SELU'),
      description: _('Scaled Exponential Linear Unit: f(x) = 1.0507 * x for x >= 0, else 1.0507 * (e^x - 1)'),
    },
    gelu: {
      func: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
      derived: x => 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
      name: _('GELU'),
      description: _('Gaussian Error Linear Unit: f(x) = 0.5 * x * (1 + tanh(√(2/π) * (x + 0.044715 * x³)))'),
    },
    swish: {
      func: x => x / (1 + Math.exp(-x)),
      derived: x => {
        const sig = 1 / (1 + Math.exp(-x));
        return sig + x * sig * (1 - sig);
      },
      name: _('Swish / SiLU'),
      description: _('Swish / Sigmoid Linear Unit: f(x) = x / (1 + e^(-x))'),
    },
  };

  return class Perceptron extends Node {
    shape = {
      shapes: [
        {
          shape: 'circle',
          x: 1,
          y: 1,
          r: 1,
        },
        {
          shape: 'text',
          fontSize: 1.2,
          text: 'Σ',
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
      { name: 'o0', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
      { name: 'i0', type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
    ];

    defaultConnector = {
      type: 'in',
      x: 0,
      y: 0,
      direction: 'left',
      extends: 'tiny',
      name: ({ index }) => `i${index}`,
    };

    fields = [
      {
        name: 'inputsCount',
        type: 'number',
        min: 1,
        _label: 'Inputs count',
      },
      {
        name: 'activationFunction',
        type: 'select',
        _label: 'Activation function',
        options: Object.entries(activationFunctions)
          .map(([key, info]) => ({
            value: key,
            label: info.name || info._name,
            title: info.description || info._description,
          })),
      },
      {
        name: 'bias',
        type: 'number',
        _label: 'Bias',
        step: 'any',
      },
      {
        name: 'weights',
        type: 'list',
        _label: 'Weights',
        item: {
          type: 'number',
          step: 'any',
        },
      }
    ];

    get inputsCount() {
      return this.connectors.filter(c => c.type === 'in').length;
    }

    set inputsCount(value) {
      const newInputsCount = this.inputsCount;
      if (value > newInputsCount) {
        for (let i = newInputsCount; i < value; i++) {
          this.addConnector();
        }
      } else if (value < newInputsCount) {
        for (let i = value; i < newInputsCount; i++) {
          this.removeLastInput();
        }
      }
    }

    minInitialValue = -5;
    maxInitialValue = 5;
    bias = null;
    weights = [];
    #activationFunction = 'relu';
    #func = activationFunctions.relu.func;
    #inputs = [];
    #output = null;
    #derived = activationFunctions.relu.derived;
    #learningRate = 0.1;

    set activationFunction(funcName) {
      const funcData = activationFunctions[funcName];
      if (funcData) {
        this.#activationFunction = funcName;
        this.#func = funcData.func;
        this.#derived = funcData.derived;
      }
    }

    get activationFunction() {
      return this.#activationFunction;
    }

    getData() {
      return {
        ...super.getData(),
        activationFunction: this.activationFunction.toString(),
      };
    }

    getNewConnector(connector) {
      return super.getNewConnector(
        {
          index: this.inputsCount,
          type: 'in',
        },
        ...arguments,
      );
    }

    update() {
      this.#inputs = this.connectors.filter(c => c.type === 'in');
      this.#output = this.connectors.find(c => c.type === 'out');

      const inputs = this.#inputs,
        l = inputs.length - 1,
        z = 15,
        n = l > z ? l : 1 + (z - 1) * Math.pow(l / z, 0.7),
        angleInc = (Math.PI * 2 * .8 ) / n,
        angleFrom = (Math.PI - angleInc * l) / 2;

      for (let i = 0, a = angleFrom; i < inputs.length; i++, a += angleInc) {
        const input = inputs[i];
        input.x = 1 - Math.sin(a);
        input.y = 1 - Math.cos(a);
        input.direction = a * 180 / Math.PI + 90;

        input.connections?.forEach(conn => conn.update());
      }

      const range = this.maxInitialValue - this.minInitialValue;
      this.bias ??= Math.random() * range + this.minInitialValue;
      this.weights ??= [];
      this.weights = this.weights?.slice(0, inputs.length);
      if (this.weights.length < inputs.length) {
        for (let i = this.weights.length; i < inputs.length; i++) {
          this.weights.push(Math.random() * range + this.minInitialValue);
        }
      }

      this.#inputs = inputs;

      super.update();
    }

    updateStatus(options = {}) {
      const linearStatus = this.connectors.filter(c => c.type === 'in')
        .map((c, index) => (c.status ?? 0) * (this.weights[index] ?? 0))
        .reduce((a, b) => a + b, 0) + (this.bias ?? 0);

      const status = this.#func(linearStatus);

      this.setStatus(status, options);
    }
  };
}