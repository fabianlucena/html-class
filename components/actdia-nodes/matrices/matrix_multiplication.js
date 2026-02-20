export default function create({ Node, _f }) {
  return class MatrixMultiplication extends Node {
    static _label = _f('Matrix multiplication');

    shape = {
      shapes: [
        {
          shape: 'rect',
          y: .5,
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          y: 1.5,
          shape: 'text',
          text: '×',
          fontSize: 1.5,
        },
      ],
    };

    box = {
      y: .5,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'i1', type: 'in', x: 0, y: 2, direction: 'left', extends: 'tiny' },
      { name: 'o', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    statusUpdated() {
      const v0 = this.inputs[0].status,
        v1 = this.inputs[1].status;

        console.log(v0, v1);
      
      this.setStatus(v0.map((row, i) =>
        row.map((_, j) => v0[i][j] * v1[j][i])
      ));

      super.statusUpdated();
    }
  };
}