import Icmp from './icmp.js';

export default class Packet {
  constructor({ src, dst, data, raw }) {
    this.create({ src, dst, data, raw });
  }

  create({ src, dst, data, raw }) {
    if (raw) {
      this.raw = raw;
      return;
    }

    if (src) {
      this.src = src;
    }

    if (dst) {
      this.dst = dst;
    }

    if (data) {
      this.data = data;
    }

    if (!this.src || !this.dst || !this.data) {
      throw new Error('Source, destination, and data are required');
    }

    if (this.src.length !== this.dst.length) {
      throw new Error('Source and destination must have the same length');
    }

    if (this.dst.length !== 16 && this.dst.length !== 4) {
      throw new Error('Source and destination must be IPv4 or IPv6 addresses');
    }

    if (!this.data.raw || !this.data.protocol) {
      throw new Error('Data must include raw and protocol');
    }

    if (this.dst.length === 4) {
      this.createIPv4();
    } else {
      this.createIPv6();
    }
  }

  createIPv4() {
    this.type = 'ipv4';
    this.protocol = 0x0800;

    const totalLength = 20 + this.data.raw.length;
    this.raw = new Uint8Array(totalLength);
    this.raw[0] = 0x45; // Version and IHL
    this.raw[1] = 0; // DSCP and ECN
    this.raw[2] = (totalLength >> 8) & 0xFF;
    this.raw[3] = totalLength & 0xFF;
    this.raw[4] = 0; // Identification
    this.raw[5] = 0;
    this.raw[6] = 0x40; // Flags and Fragment Offset
    this.raw[7] = 0;
    this.raw[8] = 64; // TTL
    this.raw[9] = this.data.protocol; // Protocol (ICMP)
    this.raw[10] = 0; // Header Checksum (placeholder)
    this.raw[11] = 0;
    this.raw.set(this.src, 12);
    this.raw.set(this.dst, 16);
    this.raw.set(this.data.raw, 20);
  }

  createIPv6() {
    this.type = 'ipv6';
    this.protocol = 0x86DD;

    this.raw = new Uint8Array(40 + this.data.raw.length);
    this.raw[0] = 0x60; // Version
    this.raw[1] = 0; // Traffic Class
    this.raw[2] = 0; // Flow Label
    this.raw[3] = 0;
    this.raw[4] = (this.data.raw.length >> 8) & 0xFF;
    this.raw[5] = this.data.raw.length & 0xFF;
    this.raw[6] = this.protocol; // Next Header
    this.raw[7] = 64; // Hop Limit
    this.raw.set(this.src, 8);
    this.raw.set(this.dst, 24);
    this.raw.set(this.data.raw, 40);
  }

  static createFromRaw({ raw, protocol }) {
    const packet = new Packet({ raw });
    packet.protocol = protocol;
    let payloadProtocol, payload;
    if (protocol === 0x0800) {
      packet.type = 'ipv4';
      packet.src = packet.raw.slice(12, 16);
      packet.dst = packet.raw.slice(16, 20);
      payloadProtocol = packet.raw[9];
      payload = packet.raw.slice(20);
    } else if (protocol === 0x86DD) {
      packet.type = 'ipv6';
      packet.src = packet.raw.slice(8, 24);
      packet.dst = packet.raw.slice(24, 40);
      payloadProtocol = packet.raw[6];
      payload = packet.raw.slice(40);
    } else {
      throw new Error('Unsupported packet protocol');
    }

    packet.data = Packet.createdPacketPayload({ protocol: payloadProtocol, payload });
    return packet;
  }

  static createdPacketPayload({ protocol, payload }) {
    if (protocol === 1) {
      return Icmp.createFromRaw({ raw: payload });
    } else {
      throw new Error('Unsupported packet payload protocol');
    }
  }
}