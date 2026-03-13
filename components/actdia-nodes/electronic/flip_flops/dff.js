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
      const inputs = this.inputs;

      const status = inputs[0].received >= 0.5 ? 1 : 0;
      this.setStatus(status, options);
    }

    propagate(options = {}) {
      const outputs = this.outputs;

      outputs[0]?.send(this.status, options);
      outputs[1]?.send(!this.status, options);
    }
  };
}