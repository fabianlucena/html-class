export default function create({ Node }) {
  return class JKFF_L extends Node {
    static label = 'JK Flip-Flop (latch)';
    static description = 'JK flip-flop (latch) circuit node. The J and K inputs control the state of the output Q when the clock input is high.';

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
      { name: 'j',   label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'k',   label: true, type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny' },
      { name: 'clk', label: true, type: 'in', x: 0, y: 3, direction: 'left', extends: 'tiny' },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    updateStatus(options = {}) {
      const clock = this.connectors.find(c => c.name === 'clk');
      if (clock.status < 0.5) {
        return;
      }

      const j = this.connectors.find(c => c.name === 'j');
      const k = this.connectors.find(c => c.name === 'k');

      if (j.status >= 0.5) {
        if (k.status >= 0.5) {
          this.setStatus(this.status >= 0.5 ? 0 : 1, options);
        } else {
          this.setStatus(1, options);
        }
      } else {
        if (k.status >= 0.5) {
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