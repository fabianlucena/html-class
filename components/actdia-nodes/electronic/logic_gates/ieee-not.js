export default async function create({ actdia }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { Not } = await actdia.importElementClassForMeta('not.js', import.meta);

  return class IEEENot extends Not {
    static label = 'IEEE Not';

    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          width: 1.5,
          height: 2,
        },
        {
          shape: 'text',
          x: 0,
          width: 1.2,
          height: 2,
          text: '1',
        },
        {
          shape: 'path',
          d: 'M 1.5 1 H 2 L 1.5 .5',
        },
      ],
    };
  };
}