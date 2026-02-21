import Node from '../../actdia/node.js';

export default class InternetSwitch extends Node {
  static label = 'Switch';
  static description = 'Internet Switch Node';

  shape = {
    fill: '#1b6ac5ff',
    stroke: '#8db3dfff',
    skewX: -20,
    sy: .66,
    children: [
      {
        shape: 'rect',
        x: 0,
        y: 0,
        width: 4,
        height: 3,
      },
      {
        fill: '#ffffffff',
        stroke: '#00000000',
        children: [
          {
            shape: 'polygon',
            points: '2.2,0.5 3.3,0.5 3.3,0.25 3.8,0.75 3.3,1.25 3.3,1 2.2,1',
          },
          {
            shape: 'polygon',
            points: '1.8,1.5 0.7,1.5 0.7,1.75 0.2,1.25 0.7,0.75 0.7,1 1.8,1',
          },
          {
            shape: 'polygon',
            points: '2.2,1.5 3.3,1.5 3.3,1.25 3.8,1.75 3.3,2.25 3.3,2 2.2,2',
          },
          {
            shape: 'polygon',
            points: '1.8,2.5 0.7,2.5 0.7,2.75 0.2,2.25 0.7,1.75 0.7,2 1.8,2',
          },
        ],
      },
    ],
  };

  connectors = [
    { name: 'in0', type: 'in', x: 0, y: 0, direction: 'left', extends: 'tiny' },
    { name: 'out0', type: 'in', x: 4, y: 1, direction: 'right', extends: 'tiny' },
  ];

  box = {
    x: 0,
    y: -.5,
    width: 4,
    height: 3,
  };
}