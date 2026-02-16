export default function create({ Node }) {
  return class MovingAverage extends Node {
    static label = 'Moving average';

    rotationCenterX = 2;
    rotationCenterY = 1.5;

    shape = {
      shapes: [
        {
          shape: 'rect',
          y: 0.5,
          width: 5,
          height: 2,
          rx: .2,
          ry: .2,
        }
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 5,
      height: 2,
    };

    connectors = [
      { name: 'i',       label: true, type: 'in', x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: 'clk',     label: true, type: 'in', x: 0, y: 2, direction: 'left',  extends: 'tiny' },
      { name: 'ma',      label: true, type: 'out', x: 5, y: 1, direction: 'right',  extends: 'tiny' },
      { name: 'valueMa', label: '[V, MA]', type: 'out', x: 5, y: 2, direction: 'right',  extends: 'tiny' },
    ];

    fields = [
      {
        name: 'windowWidth',
        _label: 'Window width',
        type: 'number',
        min: 1,
        step: 1,
      }
    ];

    data = [];
    windowWidth = 10;
    #ma = null;
    #valueMa = null;
    #sum = 0;

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#ma = this.connectors.find(c => c.name === 'ma');
        this.#valueMa = this.connectors.find(c => c.name === 'valueMa');
      }
    }

    updateStatusSync() {
      if (!this.inputs.length)
        return;
      
      while (this.data.length >= this.windowWidth) {
        const removedValue = this.data.shift();
        this.#sum -= removedValue;
      }

      const newValue = this.inputs[0].status;
      this.#sum += newValue;
      this.data.push(newValue);

      const ma = this.#sum / this.data.length;

      this.#ma.setStatus(ma);
      this.#valueMa.setStatus([this.inputs[0].status, ma]);
    }
  };
}