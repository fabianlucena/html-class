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

    #clkStatus = 0;
    #input = null;
    #clk = null;

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#input = this.connectors.find(c => c.name === 'i');
        this.#clk = this.connectors.find(c => c.name === 'clk');
      }
    }

    updateStatus(options = {}) {
      if (!this.#input || !this.#clk)
        return;

      if (this.#clk.status > 0.5) {
        if (this.#clkStatus !== 1)
          this.#clkStatus = 1;

        return;
      }

      if (this.#clk.status <= 0.5) {
        if (this.#clkStatus === 0)
          return;
        
        this.#clkStatus = 0;
      }

      this.setBackStatus(this.#input.status, options);
    }
  };
}