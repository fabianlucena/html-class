export default function create({ Node }) {
  return class TFF_E extends Node {
    static label = 'T Flip-Flop (edge triggered)';
    static description = 'T (Toggle) flip-flop (edge triggered) circuit node. The output Q changes state on the rising edge of the clock input.';

    shape = {
      children: [
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
      { name: 't',   label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny', margin: .6 },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    counter = 0;
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

      const t = this.connectors.find(c => c.name === 't');
      if (t.status >= 0.5) {
        this.counter++;
        if (this.counter >= 2) {
          this.setStatus(this.status >= 0.5 ? 0 : 1, options);
          this.counter = 0;
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