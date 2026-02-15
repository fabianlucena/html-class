export default function create({ Node }) {
  return class Counter extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: .5,
          width: 5,
          height: 1,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          y: .5,
          width: 5,
          height: 1,
          text: '1234',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 5,
      height: 1,
    };

    connectors = [
      { name: 'clk', type: 'in', x: 0, y: 1, direction: 'left', extends: 'small' },
    ];

    #clk = null;
    #clkStatus = 0;

    init() {
      super.init(...arguments);

      if (this.connectors) {
        this.#clk = this.connectors.find(c => c.name === 'clk');
      }
    }

    updateStatus() {
      if (!this.#clk)
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

      this.status = (this.status || 0) + 1;
      this.shape.shapes[1].text = '' + this.status;
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }
  };
}