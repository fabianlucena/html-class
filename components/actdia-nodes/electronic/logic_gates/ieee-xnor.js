export default async function create({ actdia, baseUrl }) {
  const { Xnor } = await actdia.importElementClass(baseUrl + '/xnor.js');
  return class IEEEXnor extends Xnor {
    static label = 'IEEE Xnor';

    shape = {
      children: [
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
          text: '=1',
        },
        {
          shape: 'path',
          d: 'M 3.5 2 H 4 L 3.5 1.5',
        },
      ],
    };
  };
}