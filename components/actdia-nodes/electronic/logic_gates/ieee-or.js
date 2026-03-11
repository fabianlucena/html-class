export default async function create({ actdia }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { Or } = await actdia.importElementClassForMeta('or.js', import.meta);

  return class IEEEOr extends Or {
    static label = 'IEEE Or';

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
          text: '≥1',
        },
      ],
    };
  };
}