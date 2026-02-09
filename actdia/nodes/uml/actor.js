export default function create({ Node }) {
  return class Actor extends Node {
    static _label = 'Actor';

    shape = {
      shapes: [
        {
          shape: 'circle',
          cx: 1.5,
          cy: 0.8,
          r: 0.8,
        },
        {
          shape: 'line',
          x1: 1.5,
          y1: 1.6,
          x2: 1.5,
          y2: 4,
        },
        {
          shape: 'line',
          x1: 0.2,
          y1: 2.5,
          x2: 2.8,
          y2: 2.5,
        },
        {
          shape: 'line',
          x1: 1.5,
          y1: 4,
          x2: 0.7,
          y2: 6,
        },
        {
          shape: 'line',
          x1: 1.5,
          y1: 4,
          x2: 2.3,
          y2: 6,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 3,
      height: 6,
    };

    connectors = [
      { name: '0', type: 'out', x: 3.5, y: 3, direction: 'right' },
    ];
  };
}