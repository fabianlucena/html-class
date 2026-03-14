export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { PCBase } = await actdia.getElementsClassOrImportForMeta('pc_base.js', import.meta);

  return class PC extends PCBase {
    static _label = _f('PC');
    static _description = _f('PC node');

    #terminalConnector = null;
    #command = '';
    #history = [];
    #historyIndex = 0;

    constructor() {
      super(...arguments);
      this.connectors.push({ name: 'terminal', type: 'io', x: -1, y: 1, direction: 'left', onRecv: param => this.onTerminalRecv(param) });
    }

    init() {
      super.init(...arguments);
      this.#terminalConnector = this.getConnector('terminal');
      this.status = '';
    }

    onTerminalRecv({ connector, data }) {
      let result = data;
      switch (data) {
        case '\x1b':
          this.#command = '';
          result = '';
          break;

        case '\x1b[A':
          if (this.#historyIndex > 0) {
            this.#historyIndex--;
          } else {
            this.#historyIndex = 0;
          }

          this.#command = this.#history[this.#historyIndex];
          result = '\x1b[1G' + this.#command;
          break;

        case '\x1b[A':
          const last = this.#history.length - 1;
          if (this.#historyIndex < last) {
            this.#historyIndex++;
          } else {
            this.#historyIndex = last;
          }
          this.#command = this.#history[this.#historyIndex];
          result = '\x1b[1G' + this.#command;
          break;

        case '\n':
          this.#history.push(this.#command);
          this.#historyIndex = this.#history.length;
          result = '\n' + this.execCommand(this.#command) + '$ ';
          this.#command = '';
          break;

        default: 
          this.#command += result;
      }
      
      connector.send(result, { force: true });
    }
  }
}