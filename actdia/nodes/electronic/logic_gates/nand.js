export default function create({ Node }) {
  return class Nand extends Node {
    shape = {
      shapes: [
        {
          shape: 'path',
          d: `
            M 0 0
            L 1.2 0 
            A 2 2 0 0 1 1.2 4 
            L 0 4
            Z
            M 3.2 2
            a 0.4 0.4 0 1 0  0.8 0
            a 0.4 0.4 0 1 0 -0.8 0`,
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
        (this.connectors.filter(c => c.type === 'in').every(c => c.status >= 0.5))?
          0 : 1,
        options
      );
    }
  };
}