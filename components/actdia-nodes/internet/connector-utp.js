export default async function create({ actdia, Connector }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class ConnectorUtp extends Connector {
    type = 'utp';
    accepts = [ 'utp' ];
    multiple = false;
    isInput = true;
    isOutput = true;

    autoRotate = false;
    shape = {
      children: [
        {
          shape: 'path',
          sx: .5,
          sy: .5,
          d: `M -.5 -.35 h 1 v .5 h -.25 v .2 h -.5 v -.2 h -.25 z`,
        },
      ],
    };
  };
}
