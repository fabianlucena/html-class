export default function create({ Node }) {
  return class SRFF_E extends Node {
    static label = 'SR Flip-Flop (Edge Triggered)';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 5,
          height: 6,
        },
        {
          shape: 'path',
          x: 0,
          y: 2.5,
          d: `M 0 0 L 0.6 0.5 L 0 1`,
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
      { name: 'clk', label: true, type: 'in', x: 0, y: 3, direction: 'left', extends: 'tiny', margin: .6 },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    previousClockStatus = 0;

    updateStatus(options = {}) {
      const clock = this.connectors.find(c => c.name === 'clk');
      if (clock.status < 0.5) {
        this.previousClockStatus = 0;
        return;
      }

      if (this.previousClockStatus >= 0.5) {
        this.previousClockStatus = 1;
        return;
      }

      this.previousClockStatus = 1;

      const inputs = this.connectors
        .filter(c => c.type === 'in');

      if (inputs[0].status >= 0.5) {
        if (inputs[1].status < 0.5) {
          this.setStatus(1, options);
        }
      } else {
        if (inputs[1].status >= 0.5) {
          this.setStatus(0, options);
        }
      }  
    }

    propagate(options = {}) {
      const outputs = this.connectors
        .filter(c => c.type === 'out');

      outputs[0].setStatus(this.status, options);
      outputs[1].setStatus(!this.status, options);
    }
  };
}