export default function create({ Node }) {
  return class RGBLed extends Node {
    static label = 'RGB LED';

    shape = {
      shapes: [
        {
          shape: 'circle',
          x: 0.5,
          y: 1.0,
          r: .4,
          fill: '#000000',
        },
      ],
    };

    box = {
      x: 0,
      y: 0.5,
      width: 1,
      height: 1,
    };

    connectors = [
      { name: 'r', type: 'in', x: 0.5, y: 0.5, direction: 'top',    extends: 'tiny' },
      { name: 'g', type: 'in', x: 0,   y: 1,   direction: 'left',   extends: 'tiny' },
      { name: 'b', type: 'in', x: 0.5, y: 1.5, direction: 'bottom', extends: 'tiny' },
    ];

    updateStatus() {
      let
        r = this.connectors[0].status || 0,
        g = this.connectors[1].status || 0,
        b = this.connectors[2].status || 0;

      if (isNaN(r) || r <= 0) r = 0;
      if (isNaN(g) || g <= 0) g = 0;
      if (isNaN(b) || b <= 0) b = 0;

      if (r > 1 || r === true) r = 1;
      if (g > 1 || g === true) g = 1;
      if (b > 1 || b === true) b = 1;

      this.shape.shapes[0].fill = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[0], this.shape.shapes[0]);
    }
  };
}