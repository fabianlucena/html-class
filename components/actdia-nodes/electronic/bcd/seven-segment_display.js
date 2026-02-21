export default function create({ Node }) {
  return class SevenSegmentDisplay extends Node {
    static label = 'Seven Segment Display';
    static description = 'Seven Segment Display circuit node.';

    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 6,
          height: 10,
          fill: '#222',
        },
        {
          x: 1.5,
          y: 1.3,
          skewX: -10,
          fill: '#C00000',
          stroke: '#400000',
          children: [
            {
              shape: 'polygon',
              points: '0.4,0.4 0.8,0 3.2,0 3.6,0.4 3.2,0.8 0.8,0.8',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '3.6,0.4 4,0.8 4,3.2 3.6,3.6 3.2,3.2 3.2,0.8',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '3.6,3.6 4,4 4,6.4 3.6,6.8 3.2,6.4 3.2,4',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '3.6,6.8 3.2,7.2 0.8,7.2 0.4,6.8 0.8,6.4 3.2,6.4',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '0.4,6.8 0,6.4 0,4 0.4,3.6 0.8,4 0.8,6.4',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '0.4,3.6 0,3.2 0,0.8 0.4,0.4 0.8,0.8 0.8,3.2',
              opacity: .1,
            },
            {
              shape: 'polygon',
              points: '0.4,3.6 0.8,3.2 3.2,3.2 3.6,3.6 3.2,4 0.8,4',
              opacity: .1,
            },
            {
              shape: 'circle',
              cx: 4.8,
              cy: 6.8,
              r: .35,
              opacity: .1,
            },
          ],
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 6,
      height: 10,
    };

    connectors = [
      { name: 'a', label: true, type: 'in', x: 1, y:  0, direction: 'top', extends: 'tiny' },
      { name: 'b', label: true, type: 'in', x: 2, y:  0, direction: 'top', extends: 'tiny' },
      { name: 'c', label: true, type: 'in', x: 3, y:  0, direction: 'top', extends: 'tiny' },
      { name: 'd', label: true, type: 'in', x: 4, y:  0, direction: 'top', extends: 'tiny' },
      { name: 'e', label: true, type: 'in', x: 1, y: 10, direction: 'bottom', extends: 'tiny' },
      { name: 'f', label: true, type: 'in', x: 2, y: 10, direction: 'bottom', extends: 'tiny' },
      { name: 'g', label: true, type: 'in', x: 3, y: 10, direction: 'bottom', extends: 'tiny' },
      { name: 'p', label: true, type: 'in', x: 4, y: 10, direction: 'bottom', extends: 'tiny' },
    ];

    updateStatus() {
      const s = this.connectors.map(c => Math.min(Math.max(c.status >= 0.5 ? 1 : 0, 0), 1));
      s.forEach((v, i) => {
        const shape = this.shape.children[1].children[i];
        shape.opacity = v * .9 + .1;
        this.actdia.tryUpdateShape(shape);
      });
    }
  };
}