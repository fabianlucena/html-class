export default function create({ Node }) {
  return class Viewer extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 12,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 12,
          height: 4,
          text: '',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 12,
      height: 4,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 2, direction: 'left' },
    ];

    updateStatus() {
      let status = this.connectors[0].status;
      if (Array.isArray(status)) {
        status = status.map(v => v ? v : 0);
      }

      if (Array.isArray(status)) {
        this.shape.shapes[1].text = JSON.stringify(status);
      } else {
        this.shape.shapes[1].text = JSON.stringify(status, null, ' ');
      }

      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }
  };
}