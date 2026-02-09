export default function create({ Node }) {
  return class TFF extends Node {
    static label = 'T Flip-Flop';
    static description = 'T (Toggle) flip-flop circuit node. On each clock pulse, the output toggles between high and low states.';

    shape = {
      shapes: [
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
      { name: 't', label: true, type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'q',  label: true, type: 'out', x: 5, y: 1, direction: 'right', extends: 'tiny' },
      { name: '!q', label: true, type: 'out', x: 5, y: 5, direction: 'right', extends: 'tiny' },
    ];

    counter = 0;

    updateStatus(options = {}) {
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