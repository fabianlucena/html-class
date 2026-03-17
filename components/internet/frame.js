export default class Frame {
  constructor({ src, dst, packet }) {
    this.create(...arguments);
  }

  create({ src, dst, packet }) {
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

    if (!this.packet.payload || !this.packet.protocol) {
      throw new Error('Packet must include payload and protocol');
    }

    this.payload = new Uint8Array(14 + this.packet.payload.length);
    this.payload.set(this.dst, 0);
    this.payload.set(this.src, 6);
    this.payload.set([this.packet.protocol >> 8, this.packet.protocol & 0xFF], 12);
    this.payload.set(this.packet.payload, 14);
    return this.payload;
  }
}