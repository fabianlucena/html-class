export default function create({ Node }) {
  return class Xnor extends Node {
    shape = {
      children: [
        {
          shape: 'path',
          d: `
            M 0.5 0
            C 2   0   3   1   3.2   2
            C 2.7 3.8 1.5   4 0.5 4
            C 1.5 3   1.5 1   0.5 0
            Z`
        },
        {
          shape: 'path',
          d: `
            M 0 0
            C 1 1 1 3 0 4
            M 0 1 H 0.6 
            M 0 3 H 0.6`,
          fill: false,
        },
        {
          shape: 'circle',
          cx: 3.7,
          cy: 2,
          r: 0.4,
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
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'i1', type: 'in', x: 0, y: 3, direction: 'left', extends: 'tiny' },
      { name: 'o0', type: 'out', x: 4, y: 2, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      this.setStatus(
        this.connectors.filter(c => c.type === 'in' && c.status >= 0.5).length === 1?
          0 : 1,
        options
      );
    }
  };
}