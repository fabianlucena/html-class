export default async function create({ actdia, Connector }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class ConnectorUtp extends Connector {
    type = 'utp';
    accepts = [ 'in' ];
    multiple = false;
  };
}
