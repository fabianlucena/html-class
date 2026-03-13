export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class SRFF_L extends Node {
    static label = 'SR Flip-Flop (Latch)';

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
      { name: 's',   label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'r',   label: true, type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in', x: 0, y: 3, direction: 'left', extends: 'tiny' },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      const clock = this.connectors.find(c => c.name === 'clk');
      if (clock.received < 0.5) {
        return;
      }

      const inputs = this.inputs;

      if (inputs[0].received >= 0.5) {
        if (inputs[1].received < 0.5) {
          this.setStatus(1, options);
        }
      } else {
        if (inputs[1].received >= 0.5) {
          this.setStatus(0, options);
        }
      }  
    }

    propagate(options = {}) {
      const outputs = this.outputs;

      outputs[0]?.send(this.status, options);
      outputs[1]?.send(!this.status, options);
    }
  };
}