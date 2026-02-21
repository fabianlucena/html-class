export default function create({ Node }) {
  return class SinglePulse extends Node {
    static label = 'Single pulse';

    rotateCenterX = 1.5;
    rotateCenterY = 1.5;

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 3,
          height: 4,
        },
        {
          shape: 'path',
          d: 'M 0.5 1.5 H .8 V .9 H 1.0 V 1.5 H 1.5',
        },
        {
          x: .5,
          y: 2.5,
          shape: 'rect',
          width: 1,
          height: 1,
          rx: .2,
          ry: .2,
        },
        {
          name: 'knob',
          shape: 'circle',
          x: 1.0,
          y: 3,
          r: .35,
          fill: 'darkred',
          stroke: 'darkred',
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 3,
      height: 4,
    };

    #delay = 200;
    #pulseWidth = 250;
    #pulsed = false;
    #timeout = null;

    connectors = [
      { name: 'q',  label: true, type: 'out', x: 3, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 3, y: 3, direction: 'right', extends: 'tiny' },
    ];

    init() {
      super.init(...arguments);
      if (!this.#pulsed) {
        this.firstPulse();
      }
    }

    firstPulse() {
      this.#pulsed = true;
      this.setStatus(0);
      if (this.#timeout) {
        clearTimeout(this.#timeout);
        this.#timeout = null;
      }

      this.#timeout = setTimeout(() => {
        if (this.#timeout) {
          clearTimeout(this.#timeout);
          this.#timeout = null;
        }

        this.pulse();
      }, this.#delay);
    }

    pulse() {
      this.setStatus(1);
      this.#timeout = setTimeout(() => {
        if (this.#timeout) {
          clearTimeout(this.#timeout);
          this.#timeout = null;
        }

        this.setStatus(0);
      }, this.#pulseWidth);
    }

    propagate() {
      const status = this.status >= 0.5 ? 1 : 0;
      this.connectors.find(c => c.name === 'q').setStatus(status);
      this.connectors.find(c => c.name === '!q').setStatus(1 - status);
    }

    statusUpdated() {
      super.statusUpdated(...arguments);
      this.updateKnob();
    }

    updateKnob() {
      const shape = this.shape.shapes[3] ??= {};
      if (this.status) {
        shape.fill = 'lightgreen';
        shape.stroke = 'darkgreen';
      } else {
        shape.fill = '#800000';
        shape.stroke = '#400000';
      }

      this.actdia?.tryUpdateShape(this.shape.shapes[3]);
    }

    onMouseDown({ evt, item, shape }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || shape?.name !== 'knob'
      )
        return;

      this.pulse();

      evt.preventDefault();
      evt.stopPropagation();
    }

    onClick({ evt, item, shape }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || shape?.name !== 'knob'
      )
        return;

      evt.preventDefault();
      evt.stopPropagation();
    }
 };
}