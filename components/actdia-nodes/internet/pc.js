const commands = {
  'help': {
    help: 'Show this command.',
    usage: 'help',
    exec: help,
  },
  'ifconfig': {
    help: 'Show network interfaces.',
    usage: 'ifconfig',
    exec: ifconfig
  },
  'ping': {
    help: 'Ping a host.',
    usage: 'ping <host>',
    exec: ping
  }
};

function usage(commandData) {
  return `Usage: ${commandData.usage}\n${commandData.help}`;
}

function help() {
  let texts = [[], []];
  for (let command in commands) {
    texts[0].push(command);
    texts[1].push(commands[command].help);
  }

  const maxSize = texts[0].reduce((max, text) => Math.max(max, text.length), 0);
  return texts[0].map((command, index) => {
    return command.padEnd(maxSize, ' ') + ' - ' + texts[1][index];
  }).join('\n');
}

function ifconfig() {
  return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n'
    + `inet ${this.ip} netmask ${this.subnet}`;
}

function ping({ args }) {
  if (args.length === 0) {
    return usage(commands.ping);
  }

  return `Pinging ${args[0]}...`;
}

export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { PCBase } = await actdia.getElementsClassOrImportForMeta('pc_base.js', import.meta);

  return class PC extends PCBase {
    static _label = _f('PC');
    static _description = _f('PC node');

    #terminalConnector = null;
    #command = '';

    constructor() {
      super(...arguments);
      this.connectors.push({ name: 'terminal', type: 'io', x: -1, y: 1, direction: 'left', onUpdate: param => this.terminalRecvHandler(param) });
    }

    init() {
      super.init(...arguments);
      this.#terminalConnector = this.getConnector('terminal');
      this.status = '';
    }

    terminalRecvHandler({ connector, status, options }) {
      if (!Object.keys(status).includes('recv')) {
        return;
      }

      let key = status.recv;
      switch (key) {
        case '\x1b':
          this.#command = '';
          key = '';
          break;

        case '\n':
          key = '\n' + this.execCommand() + '\n$ ';
          this.#command = '';
          break;

        default: 
          this.#command += key;
      }
      
      connector.setStatus({ send: key }, { force: true });
    }

    execCommand() {
      let commandText = this.#command.trim();
      if (!commandText)
        return;

      const commandParts = commandText.split(' ');
      const command = commandParts[0].trim();
      const args = commandParts.slice(1);

      const commandData = commands[command];
      if (!commandData || !commandData.exec)
        return `Unknown command: ${command}. Try help for allowed commands.`;

      return commandData.exec.bind(this)({command, args});
    }
  }
}