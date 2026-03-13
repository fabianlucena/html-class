export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class DFF extends Node {
    static label = 'D Flip-Flop';
    
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 5,
          height: 6,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 5,
      height: 6,
    };

    connectors = [
      { name: 'd', label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      const inputs = this.connectors
        .filter(c => c.isInput);

      const status = inputs[0].status >= 0.5 ? 1 : 0;
      this.setStatus(status, options);
    }

    propagate(options = {}) {
      const outputs = this.connectors
        .filter(c => c.isOutput);

      outputs[0].setStatus(this.status, options);
      outputs[1].setStatus(!this.status, options);
    }
  };
}