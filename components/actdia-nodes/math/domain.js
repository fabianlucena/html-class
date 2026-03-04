export default function create({ Node, _ }) {
  return class Domain extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 1,
          y: 1,
          text: 'R',
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
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'small' },
    ];

    fields = [
      { name: 'from', label: _('From'), type: 'number', value: -5, step: 0.1, isTool: true },
      { name: 'to',   label: _('To'),   type: 'number', value:  5, step: 0.1, isTool: true },
      { name: 'step', label: _('Step'), type: 'number', value:  1, step: 0.1, isTool: true },
    ];

    #output = null;
    #from = -5;
    #to = 5;
    #step = 1;

    get output() {
      return this.#output;
    }

    get from() {
      return this.#from;
    }

    set from(value) {
      this.setFrom(value);
    }
    
    get to() {
      return this.#to;
    }

    set to(value) {
      this.setTo(value);
    }

    get step() {
      return this.#step;
    }

    set step(value) {
      this.setStep();
    }

    init() {
      super.init(...arguments);
      this.#output = this.getConnector('output');
    }

    setFrom(value, update = true) {
      this.#from = value;
      if (update) {
        this.updateStatus();
      }
    }

    setTo(value, update = true) {
      this.#to = value;
      if (update) {
        this.updateStatus();
      }
    }

    setStep(value, update = true) {
      this.#step = value;
      if (update) {
        this.updateStatus();
      }
    }

    updateStatus() {
      const
        from = this.from,
        to = this.to, 
        step = this.step;

      let size = (to - from + step) / step;
      if (size < 0)
        size = -size;
      
      this.setStatus(Array.from({ length: size }, (_, i) => from + step * i));
    }
  };
}