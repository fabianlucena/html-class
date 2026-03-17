export default class Packet {
  constructor({ src, dst, data }) {
    this.create(...arguments)
  }

  create({ src, dst, data }) {
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

    if (!this.data.payload || !this.data.protocol) {
      throw new Error('Data must include payload and protocol');
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

    const totalLength = 20 + this.data.payload.length;
    this.payload = new Uint8Array(totalLength);
    this.payload[0] = 0x45; // Version and IHL
    this.payload[1] = 0; // DSCP and ECN
    this.payload[2] = (totalLength >> 8) & 0xFF;
    this.payload[3] = totalLength & 0xFF;
    this.payload[4] = 0; // Identification
    this.payload[5] = 0;
    this.payload[6] = 0x40; // Flags and Fragment Offset
    this.payload[7] = 0;
    this.payload[8] = 64; // TTL
    this.payload[9] = this.data.protocol; // Protocol (ICMP)
    this.payload[10] = 0; // Header Checksum (placeholder)
    this.payload[11] = 0;
    this.payload.set(this.src, 12);
    this.payload.set(this.dst, 16);
    this.payload.set(this.data.payload, 20);
  }

  createIPv6() {
    this.type = 'ipv6';
    this.protocol = 0x86DD;

    this.packet = new Uint8Array(40 + this.payload.length);
    this.packet[0] = 0x60; // Version
    this.packet[1] = 0; // Traffic Class
    this.packet[2] = 0; // Flow Label
    this.packet[3] = 0;
    this.packet[4] = (this.payload.length >> 8) & 0xFF;
    this.packet[5] = this.payload.length & 0xFF;
    this.packet[6] = this.protocol; // Next Header
    this.packet[7] = 64; // Hop Limit
    this.packet.set(this.src, 8);
    this.packet.set(this.dst, 24);
    this.packet.set(this.payload, 40);
  }
}