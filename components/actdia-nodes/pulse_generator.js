export default function create({ Node }) {
  return class PulseGenerator extends Node {
    static label = 'Pulse generator';

    rotateCenterX = 2;
    rotateCenterY = 2;

    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 4,
          height: 4,
        },
        {
          shape: 'path',
          d: 'M 0.5 1.5 L 1 1.5 L 1 0.5 L 1.5 0.5 L 1.5 1.5 L 2 1.5 L 2 0.5 L 2.5 0.5',
        },
        {
          name: 'start',
          shape: 'path',
          x: 0.6,
          y: 2,
          width: .5,
          height: .5,
          d: 'M 0 0 L 0.5 .4 L 0 0.8 Z',
          fill: '#00800001',
        },
        {
          name: 'stop',
          shape: 'rect',
          x: 1.6,
          y: 2,
          width: .8,
          height: .8,
          stroke: false,
        },
        {
          name: 'stop',
          shape: 'path',
          x: 1.6,
          y: 2,
          width: .5,
          height: .5,
          shape: 'path',
          d: 'M 0 0 L 0.25 0 L 0.25 0.8 L 0 0.8 Z'
            + ' M 0.5 0 L 0.75 0 L 0.75 0.8 L 0.5 0.8 Z',
          fill: '#800000FF',
        }
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 4,
      height: 4,
    };

    connectors = [
      { name: 'q',  label: true, type: 'out', x: 4, y: 1, direction: 'right',  extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 4, y: 3, direction: 'right',  extends: 'tiny' },
      { name: 'x',  label: true, type: 'in',  x: 1, y: 4, direction: 'bottom', extends: 'tiny' },
    ];

    #rate = 1;
    #factor = 1;
    #active = false;
    #interval = null;

    get rate() {
      return this.#rate;
    }

    set rate(value) {
      if (this.#rate !== value) {
        this.#rate = value;
        this.updateInterval();
      }
    }

    get factor() {
      return this.#factor;
    }

    set factor(value) {
      if (this.#factor !== value) {
        this.#factor = value;
        this.updateInterval();
      }
    }

    get active() {
      return this.#active;
    }

    set active(value) {
      if (this.#active !== value) {
        this.#active = value;
        this.updateInterval();
      }
    }

    init() {
      super.init(...arguments);
      this.updateInterval();
    }

    updateButtons() {
      if (this.#interval) {
        this.shape.children[2].fill = '#40FF40FF';
        this.shape.children[4].fill = '#80808001';
      } else {
        this.shape.children[2].fill = '#80808001';
        this.shape.children[4].fill = '#800000FF';
      }

      if (this.actdia) {
        this.actdia.tryUpdateShape(this.shape.children[2]);
        this.actdia.tryUpdateShape(this.shape.children[4]);
      }
    }

    onClick({ evt, item, shape }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || !item.connectors?.some(c => c.connections.length > 0)
        || !shape?.name
      )
        return;

      if (shape.name === 'start') {
        this.active = true;
        this.updateButtons();
        evt.preventDefault();
      } else if (shape.name === 'stop') {
        this.active = false;
        this.updateButtons();
        evt.preventDefault();
      }
    }

    clearInterval() {
      if (this.#interval) {
        clearInterval(this.#interval);
        this.#interval = null;
      }
    }

    updateInterval() {
      this.clearInterval();
      if (this.#interval) {
        clearInterval(this.#interval);
      }

      if (this.active) {
        const rate = this.rate * 2 * this.factor;
        if (rate > 0) {
          this.#interval = setInterval(() => {
            this.setStatus(!this.status);
          }, 1000 / rate);
        }
      }

      this.updateButtons();
    }

    updateStatus() {
      this.#factor = this.connectors.find(c => c.name === 'x').status;
      this.updateInterval();
      super.updateStatus(...arguments);
    }
  };
}