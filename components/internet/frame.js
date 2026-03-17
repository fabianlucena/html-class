import Packet from './packet.js';

export default class Frame {
  constructor({ src, dst, packet, raw }) {
    this.create({ src, dst, packet, raw });
  }

  create({ src, dst, packet, raw }) {
    if (raw) {
      src ??= raw.slice(6, 12),
      dst ??= raw.slice(0, 6),
      this.raw = raw;
    }

    if (src) {
      this.src = src;
    }

    if (dst) {
      this.dst = dst;
    }

    if (packet) {
      this.packet = packet;
    }

    if (this.src.length !== 6 || this.dst.length !== 6) {
      throw new Error('Source and destination must be MAC addresses');
    }

    if (!this.packet.raw || !this.packet.protocol) {
      throw new Error('Packet must include raw and protocol');
    }

    this.raw = new Uint8Array(14 + this.packet.raw.length);
    this.raw.set(this.dst, 0);
    this.raw.set(this.src, 6);
    this.raw.set([this.packet.protocol >> 8, this.packet.protocol & 0xFF], 12);
    this.raw.set(this.packet.raw, 14);
  }

  static createFromRaw({ raw }) {
    return new Frame({
      packet: Packet.createFromRaw({ raw: raw.slice(14), protocol: (raw[12] << 8) | raw[13] }),
      raw,
    });
  }
}