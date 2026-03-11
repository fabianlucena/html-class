export default async function create({ actdia }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { Xor } = await actdia.importElementClassForMeta('xor.js', import.meta);

  return class IEEEXor extends Xor {
    static label = 'IEEE Xor';

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
          text: '=1',
        },
      ],
    };
  };
}