export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { PCBase } = await actdia.getElementsClassOrImportForMeta('pc_base.js', import.meta);

  return class WebServer extends PCBase {
    static _label = _f('Web server');
    static _description = _f('Web server node');

    init() {
      super.init(...arguments);
      this.shape.children.push({
        shape: 'text',
        x: 0,
        y: 0,
        text: 'www',
        fontSize: .7,
      });
    }
  };
}