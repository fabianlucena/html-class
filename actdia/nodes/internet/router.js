import Node from '../../actdia/node.js';

export default class InternetRouter extends Node {
  static label = 'Router';
  static description = 'Internet Router Node';
  static import = [
    './connector-utp.js',
  ];

  shape = {
    sy: .5,
    y: -.5,
    fill: '#1b6ac5ff',
    stroke: '#8db3dfff',
    shapes: [
      {
        shape: 'path',
        d: 'M 0 2 L 0 4 A 2 2 0 0 0 4 4 L 4 2',
      },
      {
        shape: 'ellipse',
        cx: 2,
        cy: 2,
        r: 2,
      },
      {
        fill: '#ffffffff',
        stroke: '#00000000',
        shapes: [
          {
            shape: 'polygon',
            points: '0.4,1.75 1.3,1.75 1.3,1.5 1.8,2 1.3,2.5 1.3,2.25 0.4,2.25',
          },
          {
            shape: 'polygon',
            points: '3.6,2.25 2.7,2.25 2.7,2.5 2.2,2 2.7,1.5 2.7,1.75 3.6,1.75',
          },
          {
            shape: 'polygon',
            points: '1.75,1.6 1.75,0.7 1.5,0.7 2,0.2 2.5,0.7 2.25,0.7 2.25,1.6',
          },
          {
            shape: 'polygon',
            points: '2.25,2.4 2.25,3.3 2.5,3.3 2,3.8 1.5,3.3 1.75,3.3 1.75,2.4',
          },
        ],
      },
    ],
  };

  connectors = [
    { name: 'i0', type: 'utp', x: 0, y: 1, direction: 'left', extends: [ 'io', 'tiny' ], accepts: [ 'utp' ] },
    { name: 'i1', type: 'utp', x: 4, y: 1, direction: 'right', extends: [ 'io', 'tiny' ], accepts: [ 'utp' ] },
  ];

  box = {
    x: 0,
    y: -.5,
    width: 4,
    height: 3,
  };
}