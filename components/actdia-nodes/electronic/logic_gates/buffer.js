export default function create({ Node }) {
  return class Buffer extends Node {
    shape = {
      shape: 'path',
      d: `
        M 0.3 0
        L 1.7 1
        L 0.3 2
        Z
        M 0   1 L 0.3 1 
        M 1.7 1 L 2   1`
    };

    box = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'o0', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      this.setStatus(
        this.connectors.filter(c => c.type === 'in').some(c => c.status >= 0.5),
        options
      );
    }
  };
}