export default async function create({ actdia, baseUrl }) {
  const { Nand } = await actdia.importElementClass(baseUrl + '/nand.js');
  return class IEEENand extends Nand {
    static label = 'IEEE Nand';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          width: 3.5,
          height: 4,
        },
        {
          shape: 'text',
          x: 0,
          width: 3.2,
          height: 4,
          text: '&',
        },
        {
          shape: 'path',
          d: 'M 3.5 2 H 4 L 3.5 1.5',
        },
      ],
    };
  };
}