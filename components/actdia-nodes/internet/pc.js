import TermServer from './../term_server.js';

export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { PCBase } = await actdia.getElementsClassOrImportForMeta('pc_base.js', import.meta);

  return class PC extends PCBase {
    static _label = _f('PC');
    static _description = _f('PC node');

    #terminalConnector = null;
    #termServer = new TermServer({
      prompt: '> ',
      sendHandler: data => this.#terminalConnector.send(data, { force: true }),
      commandHandler: params => this.execCommand(params),
    });

    constructor() {
      super(...arguments);
      this.connectors.push({ name: 'terminal', type: 'io', x: -1, y: 1, direction: 'left', onRecv: param => this.onTerminalRecv(param) });
    }

    init() {
      super.init(...arguments);
      this.#terminalConnector = this.getConnector('terminal');
      this.status = '';
    }

    async onTerminalRecv({ connector, data }) {
      const result = await this.#termServer.receive(data);
      connector.send(result, { force: true });
    }
  }
}