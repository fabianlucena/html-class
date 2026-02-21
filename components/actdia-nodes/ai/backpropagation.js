export default function create({ Node, _ }) {
  return class Backpropagation extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          width: 4,
          height: 4,
          rx: .1,
          ry: .1,
          y: .5,
        },
        {
          shape: 'path',
          x: 2,
          y: 1,
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
      height: 4,
    };

    connectors = [
      { name: 'Δ',    label: true, type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: '!clk', label: true, type: 'in',  x: 0, y: 2, direction: 'left',  extends: 'tiny' },
      { name: 'en',   label: true, type: 'in',  x: 0, y: 3, direction: 'left',  extends: 'tiny' },
      { name: 'rst',  label: true, type: 'in',  x: 0, y: 4, direction: 'left',  extends: 'tiny' },
      { name: '#',    label: true, type: 'out', x: 4, y: 4, direction: 'right', extends: 'tiny' },
    ];

    learningRate = 0.001;
    momentum = 0.9;
    clasicMomentum = false;
    #newNodesWeights = new Map();
    #momentumCache = new Map();
    maxRamdomWeight = 0.5;
    minRandomWeight = -0.5;
    maxWeightClipping = 10.0;
    minWeightClipping = -10.0;
    randomizeOnClip = false;
    #en = null;
    #rst = null;
    #lastRst = null;

    fields = [
      {
        name: 'learningRate',
        _label: 'Learning rate',
        type: 'number',
        step: 0.0001,
      },
      {
        name: 'momentum',
        _label: 'Momentum',
        type: 'number',
        step: 0.0001,
      },
      {
        name: 'clasicMomentum',
        _label: 'Clasic momentum',
        type: 'boolean',
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
      {
        name: 'randomizeOnClip',
        _label: 'Randomize on clip',
        type: 'boolean',
      },
    ];

    update(options) {
      super.update(options);

      this.#en = this.getConnector('en');
      this.#rst = this.getConnector('rst');
    }

    updateStatus(options = {}) {
      const rst = this.#rst.status >= 0.5;
      if (this.#lastRst !== rst) {
        this.#lastRst = rst;
        if (rst) {
          this.resetNN();
        }
      }

      super.updateStatus(options);
    }

    updateStatusRSync(options = {}) {
      if (!this.inputs.length)
        return;

      if (this.#en.connections.length && !this.#en.status) {
        return;
      }

      this.#newNodesWeights = new Map();
      this.backPropagate(this, null, this.learningRate, 0);
      if (this.#newNodesWeights.size) {
        this.setStatus(this.status + 1);
        this.deltaWeights();
      }
    }

    backPropagate(node, costNode, learningRate, delta, level = 0, invalidDeep = 5) {
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

    backPropagateResetNN(node, level = 0, invalidDeep = 5) {
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
      const m = this.momentum;
      const n = this.clasicMomentum ? 1 : 1 - m;
      
      this.#newNodesWeights.forEach((dd, node) => {
        let d = dd.shift();
        let vv = this.#momentumCache.get(node) ?? {};

        if (!isNaN(d) && isFinite(d)) {
          let v = vv.bias || 0;
          v = m * v + n * d;
          vv.bias = v;

          let bias = node.bias - d;
          if (isNaN(bias) || !isFinite(bias)) {
            console.log(_('Bias reset for: %s: %s - %s', node.name, node.bias, d));
            bias = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          }

          if (bias > this.maxWeightClipping) {
            if (this.randomizeOnClip) {
              bias = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
              vv.bias = 0;
            } else {
              bias = this.maxWeightClipping;
            }
          } else if (bias < this.minWeightClipping) {
            if (this.randomizeOnClip) {
              bias = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
              vv.bias = 0;
            } else {
              bias = this.minWeightClipping;
            }
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

          vv.weights ??= [];
          let v = vv.weights[i] || 0;
          v = m * v + n * d;
          vv.weights[i] = v;

          let weight = node.weights[i] - d;
          if (isNaN(weight) || !isFinite(weight)) {
            console.log(_('Weight %s reset for: %s: %s', i, node.name, node.weights[i]));
            weight = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
          }
          
          if (weight > this.maxWeightClipping) {
            if (this.randomizeOnClip) {
              weight = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
              vv.weights[i] = 0;
            } else {
              weight = this.maxWeightClipping;
            }
          } else if (weight < this.minWeightClipping) {
            if (this.randomizeOnClip) {
              weight = Math.random() * (this.maxRamdomWeight - this.minRandomWeight) + this.minRandomWeight;
              vv.weights[i] = 0;
            } else {
              weight = this.minWeightClipping;
            }
          }

          node.weights[i] = weight;
        }

        this.#momentumCache.set(node, vv);

        node.updateStatus();
      });
    }
  };
}