export default async function create({ actdia, baseUrl }) {
  const { Xor } = await actdia.importElementClass(baseUrl + '/xor.js');
  return class IEEEXor extends Xor {
    static label = 'IEEE Xor';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          width: 4, 
          height: 4,
        },
        {
          shape: 'text',
          x: 0,
          width: 4,
          height: 4,
          text: '=1',
        },
      ],
    };
  };
}