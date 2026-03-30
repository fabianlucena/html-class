import Icmp6 from './icmp6.js';
import { ntop } from './ip_utils.js';

export default class Icmp6NeighborAdvertisement extends Icmp6 {
  get defaultType() {
    return 136; // Type: Neighbor Advertisement
  }

  constructor({
    raw,
    packet,
    flags = {},
    targetAddress,
    targetLinkLayerAddress,
    routerFlag = false,
    solicitedFlag = false,
    overrideFlag = false,
  } = {}) {
    super();

    if (packet) {
      this.setPacket(packet, false);
    }

    if (raw) {
      this.raw = raw;
      return;
    }

    if (targetAddress.length !== 16) {
      throw new Error('Target address must be 16 bytes');
    }

    if (targetLinkLayerAddress && targetLinkLayerAddress.length !== 6) {
      throw new Error('Target Link-Layer Address option must be 6 bytes');
    }

    if (flags instanceof Object) {
      flags = ((routerFlag || flags.router || flags.r ? 0x80 : 0)
        | (solicitedFlag || flags.solicited || flags.s ? 0x40 : 0)
        | (overrideFlag || flags.override || flags.o ? 0x20 : 0));
    }

    this.raw = new Uint8Array(24 + (targetLinkLayerAddress ? 8 : 0));
    this.raw[0] = this.defaultType;
    this.raw[1] = 0;
    this.raw[2] = 0; // Checksum will be calculated by the caller
    this.raw[3] = 0;
    this.raw[4] = flags;
    this.raw[5] = 0;
    this.raw[6] = 0;
    this.raw[7] = 0;
    this.raw.set(targetAddress, 8);
    if (targetLinkLayerAddress) {
      this.raw[24] = 1; // Option Type: Target Link-Layer Address
      this.raw[25] = 1; // Option Length: 1 (8 bytes)
      this.raw.set(targetLinkLayerAddress, 26);
    }
  }
  
  get targetAddress() {
    return this.raw.slice(8, 24);
  }

  get options() {
    const options = [];
    let offset = 24;
    while (offset < this.raw.length) {
      const type = this.raw[offset];
      const length = this.raw[offset + 1] * 8;
      options.push({ type, length, data: this.raw.slice(offset + 2, offset + 2 + length) });
      offset += 2 + length;
    }

    return options;
  }

  get flags() {
    return this.raw[4];
  }

  get routerFlag() {
    return !!(this.flags & 0x80);
  }

  get solicitedFlag() {
    return !!(this.flags & 0x40);
  }

  get overrideFlag() {
    return !!(this.flags & 0x20);
  }

  get targetLinkLayerAddress() {
    if (this.raw.length < 32) {
      return null;
    }

    return this.raw.slice(26, 32);
  }

  toString() {
    const optionsText = this.options.map(option => `
      Type: ${option.type}
      Length: ${option.length}
      Data: ${Array.from(option.data).map(b => b.toString(16).padStart(2, '0')).join(':')}`
    ).join('\n');

    return `ICMPv6 Neighbor Advertisement(
  Type: ${this.type}
  Code: ${this.code}
  Checksum: ${this.checksum.toString(16).padStart(4, '0')}
  Router flag: ${this.flags & 0x80 ? '1' : ''}
  Solicited flag: ${this.flags & 0x40 ? '1' : ''}
  Override flag: ${this.flags & 0x20 ? '1' : ''}
  Target Address: ${ntop(this.targetAddress)}
  Options: ${optionsText || 'None'}
)`;
  }
}