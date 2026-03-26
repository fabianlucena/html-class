import Icmp6 from './icmp6.js';
import { ntop } from './ip_utils.js';

export default class Icmp6NeighborSolicitation extends Icmp6 {
  get defaultType() {
    return 135; // Type: Neighbor Solicitation
  }

  constructor({
    raw,
    targetAddress,
    sourceLinkLayerAddress,
  } = {}) {
    super();

    if (raw) {
      this.raw = raw;
      return;
    }

    if (targetAddress.length !== 16) {
      throw new Error('Target address must be 16 bytes');
    }

    if (sourceLinkLayerAddress && sourceLinkLayerAddress.length !== 6) {
      throw new Error('Source Link-Layer Address option must be 6 bytes');
    }

    this.raw = new Uint8Array(24 + (sourceLinkLayerAddress ? 8 : 0));
    this.raw[0] = this.defaultType;
    this.raw[1] = 0;
    this.raw[2] = 0; // Checksum will be calculated by the caller
    this.raw[3] = 0;
    this.raw[4] = 0; // Reserved
    this.raw[5] = 0;
    this.raw[6] = 0;
    this.raw[7] = 0;
    this.raw.set(targetAddress, 8);
    if (sourceLinkLayerAddress) {
      this.raw[24] = 1; // Option Type: Source Link-Layer Address
      this.raw[25] = 1; // Option Length: 1 (8 bytes)
      this.raw.set(sourceLinkLayerAddress, 26);
    }
  }

  get reserved() {
    return (this.raw[4] << 24) | (this.raw[5] << 16) | (this.raw[6] << 8) | this.raw[7];
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

  toString() {
    const optionsText = this.options.map(option => `
      Type: ${option.type}
      Length: ${option.length}
      Data: ${Array.from(option.data).map(b => b.toString(16).padStart(2, '0')).join(':')}`
    ).join('\n');

    return `ICMPv6 Neighbor Solicitation(
  Type: ${this.type}
  Code: ${this.code}
  Checksum: ${this.checksum.toString(16).padStart(4, '0')}
  Reserved: ${this.reserved.toString(16).padStart(8, '0')}
  Target Address: ${ntop(this.targetAddress)}
  Options: ${optionsText || 'None'}
)`;
  }
}