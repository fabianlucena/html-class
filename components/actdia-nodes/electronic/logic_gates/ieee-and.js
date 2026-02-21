export default async function create({ actdia, baseUrl }) {
  const { And } = await actdia.importElementClass(baseUrl + '/and.js');
  return class IEEEAnd extends And {
    static label = 'IEEE And';

    shape = {
      children: [
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
          text: '&',
        },
      ],
    };
  };
}