export default function create({ Node }) {
  return class Or extends Node {
    shape = {
      shape: 'path',
      d: `
        M 0 0
        C 1.7 0   3   0.6 4 2
        C 3   3.4 1.7 4   0 4
        C 1   3   1   1   0 0
        Z
        M 0 1 H 0.6 
        M 0 3 H 0.6`
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
        this.connectors.filter(c => c.type === 'in').some(c => c.status >= 0.5)?
          1 : 0,
        options
      );
    }
  };
}