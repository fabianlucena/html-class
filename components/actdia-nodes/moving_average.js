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
      }
    ];

    data = [];
    windowWidth = 10;
    #inputs = null;
    #clk = null;
    #clkStatus = 0;
    #ma = null;
    #valueMa = null;
    #sum = 0;

    get inputs() {
      return this.#inputs;
    }

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#inputs = this.connectors.filter(c => c.name === 'i');
        this.#clk = this.connectors.find(c => c.name === 'clk');
        this.#ma = this.connectors.find(c => c.name === 'ma');
        this.#valueMa = this.connectors.find(c => c.name === 'valueMa');
      }
    }

    updateStatus() {
      if (!this.#inputs || !this.#clk)
        return;

      if (this.#clk.status <= 0.5) {
        if (this.#clkStatus !== 0)
          this.#clkStatus = 0;

        return;
      }

      if (this.#clkStatus !== 1)
        this.#clkStatus = 1;
      else
        return;
      
      if (this.data.length >= this.windowWidth) {
        const removedValue = this.data.slice(0, this.windowWidth).shift();
        this.#sum -= removedValue;
      }
      
      const newValue = this.#inputs[0].status;
      this.#sum += newValue;
      this.data.push(newValue);

      const ma = this.#sum / this.data.length;

      this.#ma.setStatus(ma);
      this.#valueMa.setStatus([this.#inputs[0].status, ma]);
    }
  };
}