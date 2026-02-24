export default function create({ Node }) {
  return class Counter extends Node {
    shape = {
      children: [
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

    updateStatusSync() {
      this.status = (this.status || 0) + 1;
      this.shape.children[1].text = '' + this.status;
      this.tryUpdateShape(this.shape.children[1]);
    }
  };
}