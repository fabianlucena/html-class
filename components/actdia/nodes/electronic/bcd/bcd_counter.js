export default function create({ Node }) {
  return class BCDCounter extends Node {
    static label = 'BCD Counter';
    static description = 'Binary-Coded Decimal (BCD) counter circuit node.';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 6,
          height: 7,
        },
        {
          shape: 'text',
          text: 'BCD Counter\nMOD-10',
          sx: 0.8,
          sy: 0.8,
          textAnchor: 'left',
          dominantBaseline: 'top',
          margin: 0.2,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 6,
      height: 7,
    };

    connectors = [
      { name: 'clk', label: 'CLK', type: 'in', x: 0, y: 4, direction: 'left', extends: 'tiny' },
      { name: 'en', label: 'EN', type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny' },
      { name: 'rst', label: 'RST', type: 'in', x: 0, y: 6, direction: 'left', extends: 'tiny' },
      { name: 'q0', label: 'Q0', type: 'out', x: 6, y: 3, direction: 'right', extends: 'tiny' },
      { name: 'q1', label: 'Q1', type: 'out', x: 6, y: 4, direction: 'right', extends: 'tiny' },
      { name: 'q2', label: 'Q2', type: 'out', x: 6, y: 5, direction: 'right', extends: 'tiny' },
      { name: 'q3', label: 'Q3', type: 'out', x: 6, y: 6, direction: 'right', extends: 'tiny' },
      { name: 'carry', label: 'Carry', type: 'out', x: 4, y: 7, direction: 'bottom', extends: 'tiny' },
    ];

    previousClockStatus = 0;

    updateStatus() {
      let reset = this.connectors.find(c => c.name === 'rst').status >= 0.5;
      if (reset) {
        this.status = 0;
        this.propagate();
        return;
      }

      let enabled = this.connectors.find(c => c.name === 'en').status >= 0.5;
      if (!enabled) {
        return;
      }

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

      if (this.status < 9) {
        this.status++;
        this.connectors.find(c => c.name === 'carry').setStatus(false);
      } else {
        this.status = 0;
        this.connectors.find(c => c.name === 'carry').setStatus(true);
      }

      this.propagate();
    }

    propagate(options = {}) {
      let outs = this.connectors.filter(c => c.type === 'out');

      const
        q0 = this.status % 2,
        q1 = (this.status % 4) >= 2 ? 1: 0,
        q2 = (this.status % 8) >= 4 ? 1: 0,
        q3 = this.status >= 8 ? 1: 0;

      if (q0 !== outs[0].status) outs[0].setStatus(q0, options);
      if (q1 !== outs[1].status) outs[1].setStatus(q1, options);
      if (q2 !== outs[2].status) outs[2].setStatus(q2, options);
      if (q3 !== outs[3].status) outs[3].setStatus(q3, options);
    }
  };
}