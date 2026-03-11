export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class InternetSwitch extends Node {
    static label = 'Switch';
    static description = 'Internet Switch Node';
    static import = [
      './connector-utp.js',
    ];

    shape = {
      fill: '#1b6ac5ff',
      stroke: '#8db3dfff',
      children: [
        {
          skewX: -18.5,
          sy: .6666666,
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
        },
        {
          shape: 'rect',
          x: -1,
          y: 2,
          width: 4,
          height: 1,
        },
        {
          shape: 'path',
          x: 3,
          y: 2,
          d: 'M 0 0 l 1 -2 l 0 1 l -1 2 Z',
        },
      ],
    };

    connectors = [
      { name: 'p00', type: 'utp', x: 0, y: 0, direction: 'left',  extends: 'tiny' },
      { name: 'p01', type: 'utp', x: 4, y: 1, direction: 'right', extends: 'tiny' },
    ];

    box = {
      x: 0,
      y: -.5,
      width: 4,
      height: 3,
    };
  };
}