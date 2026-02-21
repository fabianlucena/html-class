export default async function create({ actdia, baseUrl }) {
  const { Buffer } = await actdia.importElementClass(baseUrl + '/buffer.js');
  return class IEEEBuffer extends Buffer {
    static label = 'IEEE Buffer';

    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          width: 2,
          height: 2,
        },
        {
          shape: 'text',
          x: 0,
          width: 2,
          height: 2,
          text: '1',
        },
      ],
    };
  };
}