export default async function create({ actdia }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { ConnectorUtp } = await actdia.importElementClassForMeta('connector-utp.js', import.meta);

  return class ConnectorUtpPort extends ConnectorUtp {
    type = 'utpPort';
    accepts = [ 'utpPort' ];
  };
}
