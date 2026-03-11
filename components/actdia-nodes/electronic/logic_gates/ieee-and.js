export default async function create({ actdia }) {
  const { And } = await actdia.importElementClassForMeta('and.js', import.meta);

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