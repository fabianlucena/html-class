export default function create({ Node, _ }) {
  return class Domain extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 4,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 2,
          y: 1,
          text: _('Domain'),
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 4,
      height: 2,
    };

    connectors = [
      { name: 'output', type: 'out', x: 4, y: 1, direction: 'right',  extends: 'small' },
      { name: 'from',   type: 'in',  x: 1, y: 2, direction: 'bottom', extends: 'small' },
      { name: 'to',     type: 'in',  x: 2, y: 2, direction: 'bottom', extends: 'small' },
      { name: 'step',   type: 'in',  x: 3, y: 2, direction: 'bottom', extends: 'small' },
    ];

    fields = [
      { name: 'from', label: _('From'), type: 'number', value: -5, min: -10000, step: 0.01, isTool: true },
      { name: 'to',   label: _('To'),   type: 'number', value:  5, min: -10000, step: 0.01, isTool: true },
      { name: 'step', label: _('Step'), type: 'number', value:  1, min: 0.0001, step: 0.1, isTool: true },
    ];

    autoPropagate = true;
    #output = null;
    #from = -10;
    #to = 10;
    #step = .1;
    #fromConnector = null;
    #toConnector = null;
    #stepConnector = null;

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
      this.setStep(value);
    }

    init() {
      super.init(...arguments);
      this.#output = this.getConnector('output');
      this.#fromConnector = this.getConnector('from');
      this.#toConnector = this.getConnector('to');
      this.#stepConnector = this.getConnector('step');
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

    updateStatus({ connector } = {}) {
      if (connector === this.#fromConnector) {
        this.setFrom(this.#fromConnector.status, false);
      } else if (connector === this.#toConnector) {
        this.setTo(this.#toConnector.status, false);
      } else if (connector === this.#stepConnector) {
        this.setStep(this.#stepConnector.status, false);
      }

      const
        from = this.#from,
        to = this.#to, 
        step = Math.max(this.#step, .01);

      let size = (to - from + step) / step;
      if (size < 0)
        size = -size;
      
      const status = Array.from({ length: size }, (_, i) => from + step * i);
      
      this.setStatus(status);
    }
  };
}