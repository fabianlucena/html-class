export default function create({ Node }) {
  return class TFF_L extends Node {
    static label = 'T Flip-Flop (latch)';
    static description = 'T (Toggle) flip-flop (latch) circuit node. The output Q changes state when the clock input is high.';

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
      { name: 't',   label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny' },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    counter = 0;

    updateStatus(options = {}) {
      const clock = this.connectors.find(c => c.name === 'clk');
      if (clock.status < 0.5) {
        return;
      }
      
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