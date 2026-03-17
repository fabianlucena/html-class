import { _f } from '../../locale/locale.js';
import { generateLocalMac, macToStr, strToMac } from '../../internet/mac.js';
import {
  ntop, pton, maskToPrefix, getAddressMaskPrefix, ipToBrd, applyMask,
  isIPv4, isIPv6, isEqualIPv4AddressMask, isEqualIPv6AddressMask,
  isInSubnet,
} from '../../internet/ip_utils.js';
import IcmpEchoRequest from '../../internet/icmp_echo_request.js';
import Packet from '../../internet/packet.js';
import Frame from '../../internet/frame.js';

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
  } else if (command === 'del'.substring(0, commandLength)) {
    return ip_addr_del.bind(this)({ args: args.slice(1), commandData });
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

function ip_addr_show({ args, commandData }) {
  // ip addr show eth0
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
    const flags = [];
    if (netInterface.link === 'loopback') {
      flags.push('LOOPBACK');
    } else {
      flags.push('BROADCAST', 'MULTICAST');
    }

    flags.push(netInterface.up ? 'UP' : 'DOWN');
    flags.push(netInterface.running ? 'LOWER_UP' : 'LOWER_DOWN');

    result += `${i}: ${netInterface.name}: <${flags.join(',')}>  mtu ${netInterface.mtu}\n`
      + `    link/${netInterface.link} ${netInterface.mac} brd ${netInterface.macBrd}\n`;

    result += netInterface.inet4.map(inet => 
      `    inet ${inet.address}/${inet.prefix}${inet.broadcast ? ` brd ${inet.broadcast}` : ''} scope ${inet.scope}${inet.secondary && ' secondary' || ''}\n`
      + `       valid_lft ${inet.valid_lft} preferred_lft ${inet.preferred_lft}\n`);

    result += netInterface.inet6.map(inet6 => 
      `    inet6 ${inet6.address}/${inet6.prefix} scope ${inet6.scope}${inet6.secondary && ' secondary' || ''}\n`
      + `       valid_lft ${inet6.valid_lft} preferred_lft ${inet6.preferred_lft}\n`);

    result += '\n';
  }

  return result;
}

function ip_addr_add({ args, commandData }) {
  // ip addr add 192.168.1.50/24 dev eth0

  if (args.length < 3 || args[1] !== 'dev'.substring(0, args[1].length))
    return usage(commandData);

  const ip = args[0];
  const dev = args[2];

  this.addIPAddress({ ip, dev });

  return '';
}

function ip_addr_del({ args, commandData }) {
  // ip addr del 192.168.1.50/24 dev eth0

  if (args.length < 1)
    return usage(commandData);

  const params = { ip: args[0] };

  if (args.length > 2) {
    if (args[1] !== 'dev'.substring(0, args[1].length))
      return usage(commandData);

    params.dev = args[2];
  }

  this.deleteIPAddress(params);

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

function ip_route_show({ args, commandData }) {
  // ip route show
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
    if (route.dst === 'default') {
      result += `default via ${route.gateway} dev ${route.dev.name} proto ${route.proto} metric ${route.metric}`;
    } else {
      result += `${route.dst} dev ${route.dev.name} proto ${route.proto} scope ${route.scope} src ${route.src}${route.metric ? ` metric ${route.metric}` : ''}`;
    }

    result += '\n';
  }

  return result;
}

// sudo ip route add default via 192.168.1.1

function ping({ args }) {
  if (args.length === 0) {
    return usage(commands.ping);
  }

  var data = new IcmpEchoRequest();
  this.send({ dst: pton(args[0]), data });

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
    #routes4 = [];
    #routes6 = [];

    get netInterfaces() {
      return this.#netInterfaces.map(netInterface => ({
        name: netInterface.name,
        mac: macToStr(netInterface.mac),
        macBrd: macToStr(netInterface.macBrd),
        mtu: netInterface.mtu,
        link: netInterface.link,
        connector: netInterface.connector?.name,
        inet4: netInterface.inet4.map(inet => ({
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
      return this.#routes4.concat(this.#routes6).map(route => ({
        dst: ntop(applyMask(route.address, route.netmask)) + '/' + maskToPrefix(route.netmask),
        gateway: route.gateway ? ntop(route.gateway) : null,
        dev: route.dev,
        src: ntop(route.src),
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
      netInterface.inet4 ??= [];
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

      this.#netInterfaces.push(netInterface);

      const dev = netInterface;
      if (netInterface.inet4) {
        const inet4 = [...netInterface.inet4];
        netInterface.inet4 = [];
        inet4.forEach(inet4 => this.addIPAddress({ ...inet4, dev }));
      }

      if (netInterface.inet6) {
        const inet6 = [...netInterface.inet6];
        netInterface.inet6 = [];
        inet6.forEach(inet6 => this.addIPAddress({ ...inet6, dev }));
      }

      if (netInterface.link === 'loopback') {
        netInterface.up ??= true;
        netInterface.running ??= true;

        if (!netInterface.inet4.length) {
          this.addIPAddress({
            dev,
            ip: '127.0.0.1/8',
            scope: 'host lo',
            valid_lft: 'forever',
            preferred_lft: 'forever',
          });
        }
        if (!netInterface.inet6.length) {
          this.addIPAddress({
            dev,
            ip: '::1/128',
            scope: 'host',
            valid_lft: 'forever',
            preferred_lft: 'forever',
          });
        }
      }

      netInterface.up ??= false;
      netInterface.running ??= false;

      return netInterface;
    }

    getNetInterface(name, throwError = true) {
      if (!name) {
        if (throwError) {
          throw new Error('Network interface is required');
        }
        return null;
      }
      
      if (typeof name === 'string') {
        const nameLength = name.length;
        let founded = this.#netInterfaces.filter(i => name === i.name.substring(0, nameLength));

        if (!founded.length) {
          if (throwError) {
            throw new Error(`Network interface "${name}" not found`);
          }
          return null;
        }

        if (founded.length > 1) {
          founded = this.#netInterfaces.filter(i => name === i.name);
          if (founded.length !== 1) {
            if (throwError) {
              throw new Error('Too much interfaces');
            }
            return null;
          }
        }

        return founded[0];
      }

      var dev = name;
      if (typeof dev !== 'object') {
        if (throwError) {
          throw new Error(`Invalid network interface`);
        }
        return null;
      }

      let founded = this.#netInterfaces.filter(i => i === dev);
      if (!founded.length) {
        if (throwError) {
          throw new Error(`Network interface not found`);
        }
        return null;
      }

      if (founded.length !== 1) {
        if (throwError) {
          throw new Error('Too much interfaces');
        }
        return null;
      }

      return founded[0];
    }

    getInterfacesForAddress(ip) {
      if (isIPv4(ip.address)) {
        return this.#netInterfaces.filter(i => i.inet4.some(j => isEqualIPv4AddressMask(j, ip)));
      }

      if (isIPv6(ip.address)) {
        return this.#netInterfaces.filter(i => i.inet6.some(j => isEqualIPv6AddressMask(j, ip)));
      }

      return [];
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

      try {
        return commandData.exec.bind(this)({command, args, commandData});
      } catch (e) {
        return `Error: ${e.message}\n`;
      }
    }

    addIPAddress(inet) {
      inet = { ...inet };
      const amp = getAddressMaskPrefix(inet);
      if (amp.error) {
        throw new Error(amp.error);
      }

      inet.address = amp.address;
      inet.netmask = amp.netmask;

      inet.dev = this.getNetInterface(inet.dev);

      if (inet.address.length === 4) {
        inet.secondary = !!inet.dev.inet4.length;
        inet.dev.inet4.push(inet);
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
        dst: ntop(applyMask(inet.address, inet.netmask)) + '/' + maskToPrefix(inet.netmask),
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

    deleteIPAddress({ dev, ...inet }) {
      const amp = getAddressMaskPrefix(inet);
      if (amp.error) {
        throw new Error(amp.error);
      }

      if (dev) {
        dev = this.getNetInterface(dev);
        if (!dev) {
          throw new Error('Network interface is required');
        }
      }

      let interfaces = this.getInterfacesForAddress(amp);
      if (!interfaces.length) {
        throw new Error(`Address ${ntop(amp.address)}/${maskToPrefix(amp.netmask)} not found`);
      }

      if (interfaces.length > 1) {
        if (dev) {
          interfaces = interfaces.filter(i => i.name === dev.name);
        }

        if (interfaces.length > 1) {
          throw new Error('Too much interfaces with the same address');
        }

        if (!interfaces.length) {
          throw new Error(`Address ${ntop(amp.address)}/${maskToPrefix(amp.netmask)} not found on device ${dev.name}`);
        }
      }

      dev = interfaces[0];
      let deleted = 0;
      const inet4Index = dev.inet4.findIndex(i => isEqualIPv4AddressMask(i, amp));
      if (inet4Index !== -1) {
        dev.inet4.splice(inet4Index, 1);
        deleted++;
      }

      const inet6Index = dev.inet6.findIndex(i => isEqualIPv6AddressMask(i, amp));
      if (inet6Index !== -1) {
        dev.inet6.splice(inet6Index, 1);
        deleted++;
      }

      if (deleted === 0) {
        throw new Error(`Address ${ntop(amp.address)}/${maskToPrefix(amp.netmask)} not found on device ${dev.name}`);
      }
      
      this.updateRoutes();
    }

    updateRoutes() {
      // Implementation for updating routes
    }

    addRoute(route) {
      const amp = getAddressMaskPrefix({ ip: route.dst });
      if (amp.error) {
        throw new Error(amp.error);
      }

      const routeData = {
        address: amp.address,
        netmask: amp.netmask,
        prefix: amp.prefix,
        gateway: pton(route.gateway),
        dev: this.getNetInterface(route.dev),
        src: pton(route.src),
        proto: route.proto,
        scope: route.scope,
        metric: route.metric,
        type: route.type,
        table: route.table,
      };

      if (routeData.address.length === 4) {
        this.#routes4 = [...this.#routes4, routeData].sort((a, b) => {
          const prefixDiff = b.prefix - a.prefix;
          if (prefixDiff !== 0) {
            return prefixDiff;
          }
          
          const metricDiff = a.metric - b.metric;
          if (metricDiff !== 0) {
            return metricDiff;
          }

          return 0;
        });
      } else {
        this.#routes6 = [...this.#routes6, routeData].sort((a, b) => {
          const prefixDiff = b.prefix - a.prefix;
          if (prefixDiff !== 0) {
            return prefixDiff;
          }
          
          const metricDiff = a.metric - b.metric;
          if (metricDiff !== 0) {
            return metricDiff;
          }
          
          return 0;
        });
      }
    }

    getRouteFor(dst) {
      let routes;
      if (isIPv4(dst)) {
        routes = this.#routes4.filter(r => isInSubnet(dst, r));
      } else if (isIPv6(dst)) {
        routes = this.#routes6.filter(r => isInSubnet(dst, r));
      } else {
        throw new Error('Invalid destination address');
      }

      if (!routes.length) {
        return;
      }

      if (routes.length > 1) {
        routes.sort((a, b) => {
          const prefixDiff = b.prefix - a.prefix;
          if (prefixDiff !== 0) {
            return prefixDiff;
          }

          const metricDiff = a.metric - b.metric;
          if (metricDiff !== 0) {
            return metricDiff;
          }

          return 0;
        });
      }

      return routes[0];
    }

    send({ dst, data }) {
      if (!dst) {
        throw new Error('Destination is required');
      }

      if (!data) {
        throw new Error('Data is required');
      }

      // Find route for the destination
      let route = this.getRouteFor(dst);
      if (!route) {
        throw new Error(`No route to ${ntop(dst)}`);
      }

      let packet = new Packet({
        src: route.src,
        dst,
        data,
      });

      var frame = new Frame({
        src: route.dev.mac,
        dst: route.gateway ? strToMac(route.gateway) : route.dev.macBrd,
        packet,
      });

      if (frame.dst.every(b => b === 0)) {
        this.recv(frame.raw);
        return;
      }
    }

    recv(raw) {
      var frame = Frame.createFromRaw({ raw });
      console.log(frame);
    }
  };
};