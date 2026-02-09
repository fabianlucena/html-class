export default function create({ Node }) {
  return class DFF_E extends Node {
    static label = 'D Flip-Flop (Edge-Triggered)';

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
          y: 4.5,
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
      { name: 'd',   label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny', margin: .6 },
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

      const d = this.connectors.find(c => c.name === 'd');
      const status = d.status >= 0.5 ? 1 : 0;
      this.setStatus(status, options);
    }

    propagate(options = {}) {
      const outputs = this.connectors
        .filter(c => c.type === 'out');

      outputs[0].setStatus(this.status, options);
      outputs[1].setStatus(!this.status, options);
    }
  };
}