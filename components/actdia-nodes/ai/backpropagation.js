export default function create({ Node, _ }) {
  return class Backpropagation extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          width: 3.5,
          height: 2,
          rx: .1,
          ry: .1,
          y: .5,
        },
        {
          shape: 'path',
          x: 1.5,
          y: 0.5,
          d: `M 1,0.5
            A 0.5,0.5 0 1,1 0.5,1
            M 1,0.5 H 0.85
            M 0.85,0.5 L 1.05,0.4
            M 0.85,0.5 L 1.05,0.6`,
          fill: false
        },
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 3.5,
      height: 2,
    };

    connectors = [
      { name: 'i',   label: true, type: 'in',  x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in',  x: 0, y: 2, direction: 'left', extends: 'tiny' },
    ];

    #inputs = null;
    #clk = null;
    #clkStatus = 0;
    learningRate = 0.01;
    #newNodesWeights = new Map();

    fields = [
      {
        name: 'learningRate',
        _label: 'Learning rate',
        type: 'number',
      },
      {
        name: 'resetNN',
        _label: 'Reset NN',
        type: 'button',
        onClick: () => this.resetNN(this),
      }
    ];

    get inputs() {
      return this.#inputs;
    }

    get clk() {
      return this.#clk;
    }

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#inputs = this.connectors.filter(c => c.name === 'i');
        this.#clk = this.connectors.find(c => c.name === 'clk');
      }
    }

    updateStatus(options = {}) {
      if (!this.#inputs || !this.#clk)
        return;

      if (this.#clk.status > 0.5) {
        if (this.#clkStatus !== 1)
          this.#clkStatus = 1;

        return;
      }

      if (this.#clk.status <= 0.5) {
        if (this.#clkStatus === 0) {
          return;
        }
        
        this.#clkStatus = 0;
      }
      
      this.#newNodesWeights = new Map();
      this.backPropagate(this, null, this.learningRate, 0);
      this.setWeights();
    }

    backPropagate(node, costNode, learningRate, delta, level = 0) {
      let newLevel = level - 1;
      if (newLevel === 0) {
        return;
      }
      
      if (node.elementClass === 'Perceptron') {
        if (costNode && learningRate) {
          let sum = node.bias;
          node.inputs.forEach((i, index) => sum += i.status * node.weights[index]);
          delta *= node.derivative(sum);

          const dd = [learningRate * delta];
          node.inputs.forEach((input, index) => 
            dd.push(learningRate * delta * input.status)
          );

          if (this.#newNodesWeights.has(node)) {
            const oldDd = this.#newNodesWeights.get(node);
            for (let i = 0; i < dd.length; i++) {
              dd[i] += oldDd[i];
            }
          }

          this.#newNodesWeights.set(node, dd);
        }
      } else if (node.elementClass === 'Cost') {
        costNode = node;
        delta = costNode.derivative(...costNode.inputs.map(i => i.status));
      } else if (node.elementClass !== 'Backpropagation') {
        return;
      }

      let backNodes = node.inputs.map(i => i.connections.map(c => c?.from?.item)).flat();
      backNodes.forEach(n => this.backPropagate(n, costNode, learningRate, delta, newLevel));
    }

    resetNN(node, level = 0) {
      if (!node) {
        return;
      }

      let newLevel = level - 1;
      if (newLevel === 0) {
        return;
      }
      
      if (node.elementClass === 'Perceptron') {
        if (!this.#newNodesWeights.has(node)) {
          const dd = [];
          for (let i = 0, to = node.inputs.length + 1; i < to; i++) {
            dd.push(Math.random() * 2.0 - 1.0);
          }
          this.#newNodesWeights.set(node, dd);
        }
      } else if (node.elementClass !== 'Cost' && node.elementClass !== 'Backpropagation') {
        return;
      }

      let backNodes = node.inputs.map(i => i.connections.map(c => c?.from?.item)).flat();
      backNodes.forEach(n => this.resetNN(n, newLevel));
    }

    setWeights() {
      this.#newNodesWeights.forEach((dd, node) => {
        let bias = node.bias - dd.shift();
        if (isNaN(bias) || !isFinite(bias)) {
          console.log(_('Bias reset for: %s: %s', node.name, node.bias));
          bias = Math.random() * 2.0 - 1.0;
        }
        node.bias = bias;
        
        for (let i = 0; i < dd.length; i++) {
          let weight = node.weights[i] - dd[i];
          if (isNaN(weight) || !isFinite(weight)) {
            console.log(_('Weight %s reset for: %s: %s', i, node.name, node.weights[i]));
            weight = Math.random() * 2.0 - 1.0;
          }
          if (i > 2) {
            console.error(_('Too many weights for node: %s', node.name));
          }
          node.weights[i] = weight;
        }

        node.updateStatus();
      });
    }
  };
}