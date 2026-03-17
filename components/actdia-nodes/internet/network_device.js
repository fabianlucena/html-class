import NetworkBaseMixin from './network_base_mixin.js';

export default async function create({ actdia, Node, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class NetworkDevice extends NetworkBaseMixin(Node) {
    static import = [
      './connector-utp-port.js',
    ];
  };
}