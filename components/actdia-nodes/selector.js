export default function create({ Node, _ }) {
  return class Selector extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 4,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 4,
          height: 4,
          text: '%',
          fontSize: .6,
        },
        {
          shape: 'circle',
          x: 2,
          y: 2,
          r: 1.2,
          fill: false,
        },
        {
          shape: 'line',
          x1: 2,
          y1: .7,
          x2: 2,
          y2: 1.2,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 4,
      height: 4,
    };

    connectors = [
      { name: 'i0',  type: 'in',  x: 0, y: 2, direction: 'left',   extends: 'small' },
      { name: 'clk', type: 'in',  x: 2, y: 4, direction: 'bottom', extends: 'small' },
      { name: 'o0',  type: 'out', x: 4, y: 2, direction: 'right',  extends: 'small' },
    ];

    index = 0;

    updateStatusSync() {
      const data = this.connectors[0].status;
      if (!data || !Array.isArray(data)) {
        this.shape.shapes[1].text = _('No data');
        this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
        return;
      }

      this.index ??= 0;
      this.index++;
      if (this.index >= data.length)
        this.index = 0;

      this.setStatus(data[this.index]);

      this.shape.shapes[1].text = `${this.index} / ${data.length}`;
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);

      this.shape.shapes[3].rotate = [360 * this.index / data.length, 2, 2];
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[3], this.shape.shapes[3]);
    }
  };
}