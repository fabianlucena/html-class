export default function create({ Node }) {
  return class BCTo7Segments extends Node {
    static label = 'BCD to 7 Segments';
    static description = 'Binary-Coded Decimal (BCD) to 7-segment display circuit node.';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 6,
          height: 8,
        },
        {
          shape: 'text',
          text: 'BCD to\n7-segments\nDecoder',
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
      height: 8,
    };

    connectors = [
      { name: 'q0', label: 'Q1', type: 'in', x: 0, y: 4, direction: 'left', extends: 'tiny' },
      { name: 'q1', label: 'Q2', type: 'in', x: 0, y: 5, direction: 'left', extends: 'tiny' },
      { name: 'q2', label: 'Q3', type: 'in', x: 0, y: 6, direction: 'left', extends: 'tiny' },
      { name: 'q3', label: 'Q4', type: 'in', x: 0, y: 7, direction: 'left', extends: 'tiny' },

      { name: 'a', label: true, type: 'out', x: 6, y: 1, direction: 'right', extends: 'tiny' },
      { name: 'b', label: true, type: 'out', x: 6, y: 2, direction: 'right', extends: 'tiny' },
      { name: 'c', label: true, type: 'out', x: 6, y: 3, direction: 'right', extends: 'tiny' },
      { name: 'd', label: true, type: 'out', x: 6, y: 4, direction: 'right', extends: 'tiny' },
      { name: 'e', label: true, type: 'out', x: 6, y: 5, direction: 'right', extends: 'tiny' },
      { name: 'f', label: true, type: 'out', x: 6, y: 6, direction: 'right', extends: 'tiny' },
      { name: 'g', label: true, type: 'out', x: 6, y: 7, direction: 'right', extends: 'tiny' },
    ];

    updateStatus() {
      const q0 = this.connectors.find(c => c.name === 'q0').status >= 0.5;
      const q1 = this.connectors.find(c => c.name === 'q1').status >= 0.5;
      const q2 = this.connectors.find(c => c.name === 'q2').status >= 0.5;
      const q3 = this.connectors.find(c => c.name === 'q3').status >= 0.5;
      const decimal = (q3 ? 8 : 0) + (q2 ? 4 : 0) + (q1 ? 2 : 0) + (q0 ? 1 : 0);

      // 7-segment encoding for digits 0-9
      const segmentMap = {
        0: [1, 1, 1, 1, 1, 1, 0],
        1: [0, 1, 1, 0, 0, 0, 0],
        2: [1, 1, 0, 1, 1, 0, 1],
        3: [1, 1, 1, 1, 0, 0, 1],
        4: [0, 1, 1, 0, 0, 1, 1],
        5: [1, 0, 1, 1, 0, 1, 1],
        6: [1, 0, 1, 1, 1, 1, 1],
        7: [1, 1, 1, 0, 0, 0, 0],
        8: [1, 1, 1, 1, 1, 1, 1],
        9: [1, 1, 1, 1, 0, 1, 1],
      };

      const segments = segmentMap[decimal] || [0, 0, 0, 0, 0, 0, 0];

      this.connectors.find(c => c.name === 'a').setStatus(segments[0]);
      this.connectors.find(c => c.name === 'b').setStatus(segments[1]);
      this.connectors.find(c => c.name === 'c').setStatus(segments[2]);
      this.connectors.find(c => c.name === 'd').setStatus(segments[3]);
      this.connectors.find(c => c.name === 'e').setStatus(segments[4]);
      this.connectors.find(c => c.name === 'f').setStatus(segments[5]);
      this.connectors.find(c => c.name === 'g').setStatus(segments[6]);
    }
  };
}