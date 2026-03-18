import IPv4Packet from './ipv4_packet.js';
import IPv6Packet from './ipv6_packet.js';
import PacketPayload from './packet_payload.js';

export default class Packet {
  constructor() {
    throw new Error('Packet is an abstract class and cannot be instantiated directly');
  }

  static create({ src, dst, payload, raw }) {
    if (raw) {
      return this.createFromRaw({ raw });
    }

    if (!src || !dst || !payload) {
      throw new Error('Source, destination, and payload are required');
    }

    if (src.length !== dst.length) {
      throw new Error('Source and destination must have the same length');
    }

    if (!(payload instanceof PacketPayload)) {
      throw new Error('Payload must be an instance of PacketPayload');
    }

    if (dst.length === 4) {
      return new IPv4Packet({ src, dst, payload });
    } else if (dst.length === 16) {
      return new IPv6Packet({ src, dst, payload });
    } else {
      throw new Error('Source and destination must be IPv4 or IPv6 addresses');
    }
  }

  static createFromRaw({ raw }) {
    const version = (raw[0] >> 4) & 0xF;
    if (version === 4) {
      return new IPv4Packet({ raw });
    } else if (version === 6) {
      return new IPv6Packet({ raw });
    } else {
      throw new Error('Invalid IP version in raw data');
    }
  }
}