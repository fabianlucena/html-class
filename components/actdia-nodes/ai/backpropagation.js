export default function create({ Node, _ }) {
  return class Backpropagation extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          width: 4,
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
      width: 4,
      height: 2,
    };

    connectors = [
      { name: 'i',    label: true, type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: '!clk', label: true, type: 'in',  x: 0, y: 2, direction: 'left',  extends: 'tiny' },
      { name: '#',    label: true, type: 'out', x: 4, y: 2, direction: 'right', extends: 'tiny' },
    ];

    learningRate = 0.01;
    #newNodesWeights = new Map();
    maxRamdomWeight = 0.5;
    minRandomWeight = -0.5;
    maxWeightClipping = 10.0;
    minWeightClipping = -10.0;

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
        onClick: () => this.resetNN(),
      },
      {
        name: 'maxRamdomWeight',
        _label: 'Max random weight',
        type: 'number',
        step: 0.0001,
      },
      {
        name: 'minRandomWeight',
        _label: 'Min random weight',
        type: 'number',
        step: 0.0001,
      },
      {
        name: 'maxWeightClipping',
        _label: 'Max weight clipping',
        type: 'number',
        step: 0.0001,
      },
      {
        name: 'minWeightClipping',
        _label: 'Min weight clipping',
        type: 'number',
        step: 0.0001,
      },
    ];

    updateStatusRSync(options = {}) {
      if (!this.inputs.length)
        return;
      
      this.#newNodesWeights = new Map();
      this.backPropagate(this, null, this.learningRate, 0);
      if (this.#newNodesWeights.size) {
        this.setStatus(this.status + 1);
        this.deltaWeights();
      }
    }

    backPropagate(node, costNode, learningRate, delta, level = 0, invalidDeep = 4) {
      let newLevel = level - 1;
      if (newLevel === 0) {
        return;
      }
      
      let newInvalidDeep = invalidDeep;

      if (node.elementClass === 'Perceptron') {
        if (costNode && learningRate && delta) {
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
      } else {
        newInvalidDeep = invalidDeep - 1;
        if (newInvalidDeep === 0) {
          return;
        }
      }

      let backNodes = node.inputs.map(i => i.connections.map(c => c?.from?.item)).flat();
      backNodes.forEach(n => this.backPropagate(n, costNode, learningRate, delta, newLevel, newInvalidDeep));
    }

    resetNN() {
      this.setStatus(0);
      this.#newNodesWeights = new Map();
      this.backPropagateResetNN(this);
    }

    backPropagateResetNN(node, level = 0, invalidDeep = 4) {
      if (!node) {
        return;
      }

      let newLevel = level - 1;
      if (newLevel === 0) {
        return;
      }
      
      let newInvalidDeep = invalidDeep;

      if (node.elementClass === 'Perceptron') {
        if (!this.#newNodesWeights.has(node)) {
          node.bias = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          for (let i = 0, to = node.inputs.length; i < to; i++) {
            node.weights[i] = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          }
          this.#newNodesWeights.set(node, []);
          node.updateStatus();
        }
      } else {
        newInvalidDeep = invalidDeep - 1;
        if (newInvalidDeep === 0) {
          return;
        }
      }

      let backNodes = node.inputs.map(i => i.connections.map(c => c?.from?.item)).flat();
      backNodes.forEach(n => this.backPropagateResetNN(n, newLevel, newInvalidDeep));
    }

    deltaWeights() {
      this.#newNodesWeights.forEach((dd, node) => {
        let d = dd.shift();
        if (!isNaN(d) && isFinite(d)) {
          let bias = node.bias - d;
          if (isNaN(bias) || !isFinite(bias)) {
            console.log(_('Bias reset for: %s: %s - %s', node.name, node.bias, d));
            bias = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          }

          if (bias > this.maxWeightClipping) {
            bias = this.maxWeightClipping;
          } else if (bias < this.minWeightClipping) {
            bias = this.minWeightClipping;
          }

          node.bias = bias;
        } else {
          console.log(_('Invalid bias delta for: %s: %s', node.name, d));
        }
        
        for (let i = 0; i < dd.length; i++) {
          let d = dd[i];
          if (isNaN(d) || !isFinite(d)) {
            console.log(_('Invalid weight delta for: %s, weight %s: %s', node.name, i, d));
            continue;
          }

          let weight = node.weights[i] - d;
          if (isNaN(weight) || !isFinite(weight)) {
            console.log(_('Weight %s reset for: %s: %s', i, node.name, node.weights[i]));
            weight = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          }
          
          if (weight > this.maxWeightClipping) {
            weight = this.maxWeightClipping;
          } else if (weight < this.minWeightClipping) {
            weight = this.minWeightClipping;
          }

          node.weights[i] = weight;
        }

        node.updateStatus();
      });
    }
  };
}