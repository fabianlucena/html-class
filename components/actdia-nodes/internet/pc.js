export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { PCBase } = await actdia.importElementClassForMeta('pc_base.js', import.meta);

  return class PC extends PCBase {
    static _label = _f('PC');
    static _description = _f('PC node');
  }
}