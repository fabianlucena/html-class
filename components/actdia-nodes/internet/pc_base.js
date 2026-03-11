export default async function create({ actdia, Node, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class PCBase extends Node {
    static import = [
      './connector-utp-port.js',
    ];

    shape = {
      children: [
        {
          shape: 'rect',
          x: -1,
          y: -2,
          width: 2,
          height: 4,
        },
        {
          shape: 'rect',
          x: -.6,
          y: -1.6,
          width: 1.2,
          height: .5,
        },
      ],
    };

    connectors = [
      { name: 'lan', type: 'utpPort', x: -1, y: 0, direction: 'left' },
    ];

    box = {
      x: -1,
      y: -2,
      width: 2,
      height: 4,
    };
  };
}