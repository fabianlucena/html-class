export default function create({ Node, _ }) {
  const functions =  [
    { value: 'linear', label: _('Linear'), func: x => x, inverse: x => x },
    { value: 'threeHalves', label: _('Three halves'), func: x => Math.pow(x, 3 / 2), inverse: x => Math.pow(x, 2 / 3) },
    { value: 'quadratic', label: _('Quadratic'), func: x => x * x, inverse: x => Math.sqrt(x) },
    { value: 'cubic', label: _('Cubic'), func: x => x * x * x, inverse: x => Math.pow(x, 1 / 3) },
    { value: 'twoThirds', label: _('Two thirds'), func: x => Math.pow(x, 2 / 3), inverse: x => Math.pow(x, 3 / 2) },
    { value: 'quadraticRoot', label: _('Quadratic Root'), func: x => Math.sqrt(x), inverse: x => x * x },
    { value: 'cubicRoot', label: _('Cubic Root'), func: x => Math.pow(x, 1 / 3), inverse: x => x * x * x },
    { value: 'sinusoidal', label: _('Sinusoidal'), func: x => (Math.sin((x - 0.5) * Math.PI) + 1) / 2, inverse: x => (Math.asin((x * 2) - 1) / Math.PI) + 0.5 },
  ];

  return class Slider extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          y: -.5,
          width: 6,
          height: 1,
          rx: .1,
          ry: .1,
        },
        {
          name: 'ticks',
          shape: 'path',
          x: .5,
          d: `
            M 0   -.3 V .3
            M .5  -.3 V .3
            M 1   -.3 V .3
            M 1.5 -.3 V .3
            M 2   -.3 V .3
            M 2.5 -.3 V .3
            M 3   -.3 V .3
            M 3.5 -.3 V .3
            M 4   -.3 V .3
            M 4.5 -.3 V .3
            M 5   -.3 V .3
          `,
        },
        {
          shape: 'rect',
          x: .5,
          y: -.15,
          width: 5,
          height: .3,
          rx: .1,
          ry: .1,
        },
        {
          name: 'knob',
          shape: 'rect',
          x: 3,
          y: -.8,
          width: .4,
          height: 1.6,
          rx: .15,
          ry: .15,
        },
      ],
    };

    box = {
      x: 0,
      y: -.5,
      width: 6,
      height: 1,
    };

    connectors = [
      { name: 'o0', type: 'out', x: 6, y: 0, direction: 'right', extends: 'tiny' },
    ];

    get fields() {
      return [
        {
          name: 'size',
          type: 'number',
          _label: 'Size',
        },
        {
          name: 'min',
          type: 'number',
          _label: 'Minimum',
          step: 0,
        },
        {
          name: 'max',
          type: 'number',
          _label: 'Maximum',
          step: 0,
        },
        {
          name: 'status',
          type: 'number',
          _label: 'Status',
          min: this.min,
          max: this.max,
          step: this.range / 100,
        },
        {
          name: 'function',
          type: 'select',
          _label: 'Function',
          options: functions,
        },
      ];
    }

    #size = 6;
    min = 0;
    max = 1;
    #function = 'linear';
    #draggingKnob = false;
    #draggingFrom = null;

    get size() {
      return this.#size;
    }

    set size(value) {
      this.#size = value;
      this.box.width = value;
      this.shape.shapes[0].width = value;
      this.shape.shapes[1].width = value - 1;
      this.connectors[0].x = value;
      this.update();
    }

    get range() {
      return this.max - this.min;
    }

    get function() {
      this.#function = this.#function || 'linear';
    }

    set function(value) {
      this.#function = value;
      this.updateFunc();
    }

    updateFunc() {
      const funcObj = functions.find(f => f.value === this.#function) || functions[0];
      this.func = funcObj?.func || (x => x);
      this.inv = funcObj?.inverse || (x => x);
      this.update();
    }

    getData() {
      const data = super.getData();
      data.status = this.status;
      data.function = this.#function;
      data.size = this.size;
      data.min = this.min;
      data.max = this.max;
      return data;
    }

    statusUpdated() {
      this.updateKnob();
      super.statusUpdated();
    }

    func = x => x;
    inv = x => x;

    update() {
      super.update();

      const ticksShape = this.shape.shapes.find(s => s.name === 'ticks');
      if (ticksShape) {
        const size = this.size - 1;
        let path = '';
        ticksShape.x = .5;
        for (let i = 0; i <= 1; i += .1) {
          path += `M ${this.func(i) * size} -.3 V .3 `;
        }
        ticksShape.d = path;
      }

      this.updateKnob();
    }

    updateKnob() {
      const shape = this.shape.shapes.find(s => s.name === 'knob') ?? {};
      if (this.#draggingKnob) {
        shape.fill = '#808080';
      } else {
        shape.fill = null;
      }

      shape.x = (this.inv(this.status) - this.min) / this.range * (this.size - 1) + .2;
      this.actdia?.tryUpdateShape(shape);
    }

    onClick({ evt, item, shape }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || item.shapes?.some(s => s.connector)
        || shape?.name !== 'knob'
      )
        return;

      evt.preventDefault();
    }

    onMouseDown({ evt, item, shape, mouse }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || item.shapes?.some(s => s.connector)
        || shape?.name !== 'knob'
      ) {
        this.#draggingKnob = false;
        this.updateKnob();
        return;
      }

      const pos = isNaN(shape.x)? 0 : (shape.x ?? 0);

      const ux = Math.cos(this.rotate / 180 * Math.PI);
      const uy = Math.sin(this.rotate / 180 * Math.PI);

      evt.preventDefault();
      this.#draggingKnob = true;
      this.#draggingFrom = {
        x: mouse.x - pos * ux,
        y: mouse.y - pos * uy,
      };
      
      this.updateKnob();
    }

    onMouseUp({ evt, item, shape }) {
      this.#draggingKnob = false;
      this.updateKnob();
    }

    onMouseMove({ evt, item, shape, mouse }) {
      if (!this.#draggingKnob)
        return;

      if (!item.actdia
        || evt.buttons !== 1
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || item.shapes?.some(s => s.connector)
      ) {
        this.#draggingKnob = false;
        this.updateKnob();
        return;
      }

      evt.preventDefault();

      const dx = mouse.x - this.#draggingFrom.x;
      const dy = mouse.y - this.#draggingFrom.y;

      const ux = Math.cos(this.rotate / 180 * Math.PI);
      const uy = Math.sin(this.rotate / 180 * Math.PI);

      let delta = (dx * ux + dy * uy - 0.2) / (this.size - 1);

      if (delta < 0)
        delta = 0;
      if (delta > 1)
        delta = 1;
      let newStatus = this.min + this.func(delta) * this.range;
      if (newStatus < this.min)
        newStatus = this.min;
      if (newStatus > this.max)
        newStatus = this.max;
      
      this.setStatus(newStatus);
      this.actdia.showLabelForItem(this);
    }
  };
}