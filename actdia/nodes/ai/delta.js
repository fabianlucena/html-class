export default function create({ Node }) {
  return class Delta extends Node {
    shape = {
      shapes: [
        {
          shape: 'circle',
          x: 1,
          y: 1,
          r: 1,
        },
        {
          shape: 'text',
          text: 'Δ',
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in',  x: 0.293, y: 0.293, direction:  135,  extends: 'tiny' },
      { name: 'i1', type: 'in',  x: 0.293, y: 1.707, direction: -135,  extends: 'tiny' },
      { name: 'o0', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      const inputs = this.connectors
        .filter(c => c.type === 'in')
        .map(i => i.status);

      let status = inputs[1] - inputs[0];

      this.setStatus(status, options);
    }
  };
}