import { _f } from '../../locale/locale.js';
import { generateLocalMac, macToStr, strToMac } from '../../internet/mac.js';
import { ntop, pton, maskToPrefix, prefixToMask, ipToBrd } from '../../internet/ip.js';

const commands = {
  'help': {
    help: 'Show this command.',
    usage: 'help',
    exec: help,
  },
  'clear': {
    help: 'Clear the screen.',
    usage: 'clear',
    exec: clear,
  },
  'ip': {
    help: 'Show network interfaces.',
    usage: 'ip a',
    exec: ip
  },
  'ping': {
    help: 'Ping a host.',
    usage: 'ping <host>',
    exec: ping
  }
};

function usage(commandData) {
  return `Usage: ${commandData.usage}\n${commandData.help}\n`;
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
  }).join('\n') + '\n';
}

function clear() {
  return '\x1B[2J\x1B[H';
}

function ip({ args, commandData }) {
  if (args.length > 1 || args[0] !== 'a')
    return usage(commandData);

  
/*$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever

2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 3c:97:0e:12:ab:cd brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.15/24 brd 192.168.0.255 scope global dynamic enp3s0
       valid_lft 86399sec preferred_lft 86399sec
    inet6 fe80::3e97:eff:fe12:abcd/64 scope link 
       valid_lft forever preferred_lft forever

3: wlp2s0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
    link/ether 54:27:8d:aa:bb:cc brd ff:ff:ff:ff:ff:ff*/

  let result = '';
  for (let i in this.netInterfaces) {
    const netInterface = this.netInterfaces[i];
    result += `${i}: ${netInterface.name}: <${netInterface.link === 'loopback' ? 'LOOPBACK,UP,LOWER_UP' : 'BROADCAST,MULTICAST,UP,LOWER_UP'}>  mtu ${netInterface.mtu}\n`
      + `    link/${netInterface.link} ${netInterface.mac} brd ${netInterface.macBrd}\n`;

    result += netInterface.inet.map(inet => 
      `    inet ${inet.address}/${inet.prefix}${inet.broadcast ? ` brd ${inet.broadcast}` : ''} scope ${inet.scope}\n`
      + `       valid_lft ${inet.valid_lft} preferred_lft ${inet.preferred_lft}`)
      .join('\n') + '\n';

    result += netInterface.inet6.map(inet6 => 
      `    inet6 ${inet6.address}/${inet6.prefix} scope ${inet6.scope}\n`
      + `       valid_lft ${inet6.valid_lft} preferred_lft ${inet6.preferred_lft}`)
      .join('\n') + '\n ';

    result += '\n';
  }

  return result;
}

function ping({ args }) {
  if (args.length === 0) {
    return usage(commands.ping);
  }

  return `Pinging ${args[0]}...\n`;
}

export default function NetworkBaseMixin(Base) {
  return class extends Base {
    static fields = [
      {
        name: 'hostname',
        type: 'string',
        _label: _f('Hostname'),
      },
      {
        name: 'macString',
        type: 'string',
        _label: _f('MAC address'),
        readOnly: true,
      },
      {
        name: 'ip',
        type: 'string',
        _label: _f('IP address'),
      },
      {
        name: 'subnet',
        type: 'string',
        _label: _f('Subnet mask'),
      },
      {
        name: 'gateway',
        type: 'string',
        _label: _f('Default gateway'),
      },
    ];

    hostname = null;
    #netInterfaces = [];
    #routes = [];

    get netInterfaces() {
      return this.#netInterfaces.map(netInterface => ({
        name: netInterface.name,
        mac: macToStr(netInterface.mac),
        macBrd: macToStr(netInterface.macBrd),
        mtu: netInterface.mtu,
        link: netInterface.link,
        connector: netInterface.connector?.name,
        inet: netInterface.inet.map(inet => ({
          address: ntop(inet.address),
          prefix: maskToPrefix(inet.netmask),
          netmask: ntop(inet.netmask),
          broadcast: inet.broadcast ? ntop(inet.broadcast) : null,
          scope: inet.scope,
          valid_lft: inet.valid_lft,
          preferred_lft: inet.preferred_lft,
        })),
        inet6: netInterface.inet6.map(inet6 => ({
          address: ntop(inet6.address),
          prefix: maskToPrefix(inet6.netmask),
          netmask: ntop(inet6.netmask),
          broadcast: inet6.broadcast ? ntop(inet6.broadcast) : null,
          scope: inet6.scope,
          valid_lft: inet6.valid_lft,
          preferred_lft: inet6.preferred_lft,
        })),
      }));
    }

    set netInterfaces(value) {
      this.#netInterfaces = [];
      value.forEach(netInterface => this.addNetInterface(netInterface));
    }

    addNetInterface(netInterface = {}) {
      netInterface = { ...netInterface };
      netInterface.name ??= `eth${this.netInterfaces.length}`;
      netInterface.link ??= 'ether';
      netInterface.inet ??= [];
      netInterface.inet6 ??= [];

      if (netInterface.link === 'loopback') {
        netInterface.mac ??= new Uint8Array(6);
        netInterface.mtu ??= 65536;
        netInterface.macBrd ??= new Uint8Array(6);
      } else {
        netInterface.mac ??= generateLocalMac();
        netInterface.mtu ??= 1500;
        netInterface.macBrd ??= new Uint8Array(6).fill(255);
      }

      if (typeof netInterface.mac === 'string')
        netInterface.mac = strToMac(netInterface.mac);

      if (typeof netInterface.macBrd === 'string')
        netInterface.macBrd = strToMac(netInterface.macBrd);

      if (typeof netInterface.connector === 'string')
        netInterface.connector = this.getConnector(netInterface.connector);

      if (netInterface.inet) {
        const inet = [...netInterface.inet];
        netInterface.inet = [];
        inet.forEach(inet => this.addIPAddress(netInterface, inet));
      }

      if (netInterface.inet6) {
        const inet6 = [...netInterface.inet6];
        netInterface.inet6 = [];
        inet6.forEach(inet6 => this.addIPAddress(netInterface, inet6));
      }

      if (netInterface.link === 'loopback') {
        if (!netInterface.inet.length) {
          netInterface.inet = [
            {
              address: pton('127.0.0.1'),
              netmask: pton('255.0.0.0'),
              scope: 'host lo',
              valid_lft: 'forever',
              preferred_lft: 'forever',
            },
          ];
        }
        if (!netInterface.inet6.length) {
          netInterface.inet6 = [
            {
              address: pton('::1'),
              netmask: pton('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'),
              scope: 'host',
              scope: 'host',
              valid_lft: 'forever',
              preferred_lft: 'forever',
            },
          ];
        }
      }

      this.#netInterfaces.push(netInterface);

      return netInterface;
    }

    addIPAddress(netInterface, ip, inet) {
      if (typeof ip === 'object' && !inet) {
        inet = ip;
        ip = null;
      }

      inet ??= {};

      let address;
      if (ip) {
        let prefix;
        [address, prefix] = ip.split('/');
        address = pton(address);
        if (typeof prefix !== 'undefined') {
          inet.netmask ??= prefixToMask(parseInt(prefix), address.length);
        } else if (!inet.netmask) {
          if (typeof inet.prefix !== 'undefined') {
            inet.netmask ??= prefixToMask(parseInt(inet.prefix), address.length);
          } else {
            throw new Error('Netmask or prefix is required');
          }
        }
      } else {
        address = pton(inet.address);
        inet.netmask = pton(inet.netmask) ?? pton(inet.mask);
      }

      inet.address = address;

      if (address.length === 4) {
        netInterface.inet.push(inet);
        inet.scope ??= 'global dynamic ' + netInterface.name;
      } else if (address.length === 16) {
        netInterface.inet6.push(inet);
        inet.netmask ??= prefixToMask(parseInt(prefix), 16);
        inet.scope ??= 'link';
      } else {
        throw new Error('Invalid IP address length');
      }

      inet.broadcast = ipToBrd(address, inet.netmask);

      inet.valid_lft ??= '86399sec';
      inet.preferred_lft ??= '86399sec';
    }

    getNetInterface(name) {
      return this.netInterfaces.find(netInterface => netInterface.name === name);
    }

    execCommand(command) {
      let commandText = command.trim();
      if (!commandText)
        return '';

      const commandParts = commandText.split(' ');
      const command1 = commandParts[0].trim();
      const args = commandParts.slice(1);

      const commandData = commands[command1];
      if (!commandData || !commandData.exec)
        return `Unknown command: ${command1}. Try help for allowed commands.\n`;

      return commandData.exec.bind(this)({command, args, commandData});
    }
  };
};