export default async function create({ actdia, baseUrl }) {
  const { Or } = await actdia.importElementClass(baseUrl + '/or.js');
  return class IEEEOr extends Or {
    static label = 'IEEE Or';

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
          text: '≥1',
        },
      ],
    };
  };
}