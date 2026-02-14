export default function create({ Node }) {
  return class Backpropagation extends Node {
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
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i', type: 'in',  x: 0.293, y: 0.293, direction:  135,  extends: 'tiny' },
      { name: 'clk', type: 'in',  x: 0.293, y: 1.707, direction: -135,  extends: 'tiny' },
    ];

    #inputs = null;
    #clk = null;
    #clkStatus = 0;
    #learningRate = 0.01;

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
      
      this.backPropagate(this, null, this.#learningRate, 0);
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

          const bias = node.bias - learningRate * delta;
          if (!isNaN(bias) && !isFinite(bias)) {
            node.bias -= learningRate * delta;
          } else if (isNaN(node.bias) || isFinite(node.bias)) {
            node.bias = Math.random() * 2.0 - 1.0;
          }

          node.inputs.forEach((i, index) => {
            const weight = node.weights[index] - learningRate * delta * i.status;
            if (!isNaN(weight) && !isFinite(weight)) {
              node.weights[index] = weight;
            } else if (isNaN(node.weights[index]) || isFinite(node.weights[index])) {
              node.weights[index] = Math.random() * 2.0 - 1.0;
            }
          });
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
  };
}