import { _f } from '../../locale/locale.js';
import { generateLocalMac, macToStr, strToMac } from '../../internet/mac.js';
import { ntop, pton, maskToPrefix, prefixToMask, ipToBrd, applyMask } from '../../internet/ip.js';

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
    usage: 'ip addr',
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
  if (args[0] === 'help'.substring(0, args[0].length)) {
    return ip_help.bind(this)({ args: args.slice(1), commandData });
  }

  if (args[0] === 'address'.substring(0, args[0].length)) {
    return ip_addr.bind(this)({ args: args.slice(1), commandData });
  }

  if (args[0] === 'route'.substring(0, args[0].length)) {
    return ip_route.bind(this)({ args: args.slice(1), commandData });
  }

  return usage(commandData);
}

function ip_help() {
  return `ip [ OPTIONS ] OBJECT { COMMAND | help }

OBJECT :=
  address
  route
  link
  neigh
  rule
  tunnel
  maddr
  monitor\n`;
}

function ip_addr({ args, commandData }) {
  const command = args[0] ?? 'show',
    commandLength = command.length ;

  if (command === 'help'.substring(0, commandLength)) {
    return ip_addr_help.bind(this)({ args: args.slice(1), commandData });
  } else if (command === 'show'.substring(0, commandLength)) {
    return ip_addr_show.bind(this)({ args: args.slice(1), commandData });
  } else if (command === 'add'.substring(0, commandLength)) {
    return ip_addr_add.bind(this)({ args: args.slice(1), commandData });
  }

  if (!args[0])
    return `No command specified, try "ip address help"\n`;

  return `Command "${args[0]}" is unknown, try "ip address help"\n`;
}

function ip_addr_help() {
  return `Usage: ip address { add | del } IFADDR dev STRING
       ip address { show | flush } [ dev STRING ] [ scope SCOPE-ID ]
                                 [ to PREFIX ] [ FLAG-LIST ] [ label PATTERN ]
       ip address { save | restore }
       ip address { help }

IFADDR := PREFIX | ADDR peer PREFIX
          [ broadcast ADDR ] [ anycast ADDR ]
          [ label STRING ] [ scope SCOPE-ID ]
          [ metric NUMBER ] [ valid_lft LFT ] [ preferred_lft LFT ]

SCOPE-ID := [ host | link | global | NUMBER ]

FLAG-LIST := [ dynamic | permanent | secondary | primary | tentative |
               deprecated | dadfailed | temporary | CONFFLAG-LIST ]

CONFFLAG-LIST := [ home | nodad | mngtmpaddr | noprefixroute | autojoin ]\n`;
}

// ip addr show eth0
function ip_addr_show({ args, commandData }) {
  if (args.length > 1)
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

  if (!this.netInterfaces.length)
    return 'No devices found.\n';

  let interfaces;
  if (args.length) {
    const filter = args[0],
      filterLength = filter.length;
    interfaces = this.netInterfaces
      .filter(i => filter === i.name.substring(0, filterLength));

    if (interfaces.length !== 1)
      interfaces = this.netInterfaces;
  } else {
    interfaces = this.netInterfaces;
  }

  let result = '';
  for (let i in interfaces) {
    const netInterface = interfaces[i];
    result += `${i}: ${netInterface.name}: <${netInterface.link === 'loopback' ? 'LOOPBACK,UP,LOWER_UP' : 'BROADCAST,MULTICAST,UP,LOWER_UP'}>  mtu ${netInterface.mtu}\n`
      + `    link/${netInterface.link} ${netInterface.mac} brd ${netInterface.macBrd}\n`;

    result += netInterface.inet.map(inet => 
      `    inet ${inet.address}/${inet.prefix}${inet.broadcast ? ` brd ${inet.broadcast}` : ''} scope ${inet.scope}${inet.secondary && ' secondary' || ''}\n`
      + `       valid_lft ${inet.valid_lft} preferred_lft ${inet.preferred_lft}`)
      .join('\n') + '\n';

    result += netInterface.inet6.map(inet6 => 
      `    inet6 ${inet6.address}/${inet6.prefix} scope ${inet6.scope}${inet6.secondary && ' secondary' || ''}\n`
      + `       valid_lft ${inet6.valid_lft} preferred_lft ${inet6.preferred_lft}`)
      .join('\n') + '\n ';

    result += '\n';
  }

  return result;
}

// ip addr add 192.168.1.50/24 dev eth0
function ip_addr_add({ args, commandData }) {
  if (args.length < 3 || args[1] !== 'dev'.substring(0, args[1].length))
    return usage(commandData);

  const ip = args[0];
  const dev = args[2];

  this.addIPAddress({ ip, dev });

  return '';
}

function ip_route({ args, commandData }) {
  const command = args[0] ?? 'show',
    commandLength = command.length ;

  if (command === 'help'.substring(0, commandLength)) {
    return ip_route_help.bind(this)({ args: args.slice(1), commandData });
  } else if (command === 'show'.substring(0, commandLength)) {
    return ip_route_show.bind(this)({ args: args.slice(1), commandData });
  }

  if (!args[0])
    return `No command specified, try "ip route help"\n`;

  return `Command "${args[0]}" is unknown, try "ip route help"\n`;
}

function ip_route_help() {
  return `Usage: ip route { list | flush } SELECTOR
       ip route get ADDRESS
       ip route { add | del | change | append | replace } ROUTE

SELECTOR := [ root PREFIX ] [ match PREFIX ] [ exact PREFIX ]
            [ table TABLE_ID ] [ proto RTPROTO ]
            [ type TYPE ] [ scope SCOPE ]

ROUTE := NODE_SPEC [ INFO_SPEC ]

NODE_SPEC := [ TYPE ] PREFIX [ tos TOS ]
             [ table TABLE_ID ] [ proto RTPROTO ]
             [ scope SCOPE ] [ metric METRIC ]

INFO_SPEC := { NH | nhid ID } OPTIONS FLAGS [ nexthop NH ]...

NH := [ via ADDRESS ] [ dev STRING ] [ weight NUMBER ] ...\n`;
}

// ip addr show
function ip_route_show({ args, commandData }) {
  if (args.length > 1)
    return usage(commandData);

/*$ default via 192.168.1.1 dev eth0 proto dhcp metric 100
10.0.0.0/24 dev docker0 proto kernel scope link src 10.0.0.1
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50 metric 100 */

  if (!this.routes.length)
    return 'No routes found.\n';

  let routes = this.routes;

  let result = '';
  for (let i in routes) {
    const route = routes[i];
    if (route.destination === 'default') {
      result += `default via ${route.gateway} dev ${route.dev.name} proto ${route.proto} metric ${route.metric}`;
    } else {
      result += `${route.destination} dev ${route.dev.name} proto ${route.proto} scope ${route.scope} src ${route.src}${route.metric ? ` metric ${route.metric}` : ''}`;
    }

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

// sudo ip route add default via 192.168.1.1
// sudo ip addr del 192.168.1.50/24 dev eth0

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
          secondary: inet.secondary,
          dynamic: inet.dynamic,
          scope: inet.scope,
          valid_lft: inet.valid_lft,
          preferred_lft: inet.preferred_lft,
        })),
        inet6: netInterface.inet6.map(inet6 => ({
          address: ntop(inet6.address),
          prefix: maskToPrefix(inet6.netmask),
          netmask: ntop(inet6.netmask),
          broadcast: inet6.broadcast ? ntop(inet6.broadcast) : null,
          secondary: inet6.secondary,
          dynamic: inet6.dynamic,
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

    get routes() {
      return this.#routes.map(route => ({
        destination: route.destination,
        gateway: route.gateway,
        dev: route.dev,
        src: route.src,
        proto: route.proto,
        scope: route.scope,
        metric: route.metric,
        type: route.type,
        table: route.table,
      }));
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

      const dev = netInterface;
      if (netInterface.inet) {
        const inet = [...netInterface.inet];
        netInterface.inet = [];
        inet.forEach(inet => this.addIPAddress({ ...inet, dev }));
      }

      if (netInterface.inet6) {
        const inet6 = [...netInterface.inet6];
        netInterface.inet6 = [];
        inet6.forEach(inet6 => this.addIPAddress({ ...inet6, dev }));
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

    addIPAddress(inet) {
      inet = { ...inet };
      if (!inet.address) {
        if (!inet.ip) {
          throw new Error('IP address is required');
        }
        
        let [address, prefix] = inet.ip.split('/');
        inet.address = pton(address);

        if (!inet.netmask) {
          if (typeof prefix !== 'undefined') {
            inet.netmask ??= prefixToMask(parseInt(prefix), address.length);
          }
        } else if (typeof inet.netmask === 'string') {
          inet.netmask = pton(inet.netmask);
        }
      }

      if (typeof inet.address === 'string') {
        inet.address = pton(inet.address);
      }

      if (inet.address.length !== 4 && inet.address.length !== 16) {
        throw new Error('Invalid IP address length');
      }

      if (!inet.netmask) {
        throw new Error('Netmask or prefix is required');
      }

      if (typeof inet.netmask === 'string') {
        inet.netmask = pton(inet.netmask);
      }

      if (!inet.dev) {
        throw new Error('Network interface is required');
      }

      if (typeof inet.dev === 'string') {
        const name = inet.dev,
          nameLength = name.length;
          
        const founded = this.#netInterfaces.filter(i => name === i.name.substring(0, nameLength));
        if (!founded.length)
          throw new Error(`Network interface "${inet.dev}" not found`);

        if (founded.length > 1)
          throw new Error('Too much interfaces');

        inet.dev = founded[0];
      }

      if (inet.address.length === 4) {
        inet.secondary = !!inet.dev.inet.length;
        inet.dev.inet.push(inet);
        inet.scope ??= 'global';
      } else {
        inet.secondary = !!inet.dev.inet6.length;
        inet.dev.inet6.push(inet);
        inet.scope ??= 'link';
      }

      inet.broadcast = ipToBrd(inet.address, inet.netmask);

      inet.valid_lft ??= '86399sec';
      inet.preferred_lft ??= '86399sec';

      this.addRoute({
        destination: ntop(applyMask(inet.address, inet.netmask)) + '/' + maskToPrefix(inet.netmask),
        gateway: null,
        dev: inet.dev,
        src: ntop(inet.address),
        proto: 'kernel',
        scope: inet.scope,
        metric: inet.secondary ? 100 : 0,
        type: 'unicast',
        table: 'main',
      });
    }

    addRoute(route) {
      route = { ...route };
      this.#routes.push(route);
    }
  };
};