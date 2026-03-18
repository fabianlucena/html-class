import FramePayload from './frame_payload.js';
import PacketPayload from './packet_payload.js';

export default class IPv4Packet extends FramePayload {
  constructor({ src, dst, payload, raw }) {
    super();

    if (raw) {
      this.raw = raw;
      this.payload = PacketPayload.createFromRaw({ protocol: this.protocol, raw: raw.slice(this.headerLength) });
      return;
    }

    this.create({ src, dst, payload });
  }

  get parentProtocol() {
    return 0x0800;
  }

  get version() {
    return (this.raw[0] >> 4) & 0xF;
  }

  get ihl() {
    return this.raw[0] & 0xF;
  }

  get headerLength() {
    return this.ihl * 4;
  }

  get dscp() {
    return (this.raw[1] >> 2) & 0x3F;
  }

  get ecn() {
    return this.raw[1] & 0x3;
  }

  get totalLength() {
    return (this.raw[2] << 8) | this.raw[3];
  }

  set totalLength(value) {
    this.setTotalLength(value);
  }

  get identification() {
    return (this.raw[4] << 8) | this.raw[5];
  }

  get flags() {
    return (this.raw[6] >> 5) & 0x7;
  }

  get fragmentOffset() {
    return ((this.raw[6] & 0x1F) << 8) | this.raw[7];
  }

  get ttl() {
    return this.raw[8];
  }

  get protocol() {
    return this.raw[9];
  }

  get headerChecksum() {
    return (this.raw[10] << 8) | this.raw[11];
  }

  get src() {
    return this.raw.slice(12, 16);
  }

  get dst() {
    return this.raw.slice(16, 20);
  }

  create({ src, dst, payload }) {
    if (this.raw) {
      throw new Error('Packet is already created');
    }

    if (!src || !dst) {
      throw new Error('Source and destination must be provided');
    }

    if (src.length !== 4 || dst.length !== 4) {
      throw new Error('Source and destination must be IPv4 addresses');
    }

    if (!payload) {
      throw new Error('Payload must be provided');
    }

    this.payload = payload;

    const totalLength = 20 + (payload?.raw.length || 0);

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
    this.raw[9] = this.payload?.protocol; // Protocol (ICMP)
    this.raw[10] = 0; // Header Checksum (placeholder)
    this.raw[11] = 0;
    this.raw.set(src, 12);
    this.raw.set(dst, 16);
    this.raw.set(this.payload?.raw, 20);
  }

  update() {
    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < this.headerLength; i += 2) {
      checksum += (this.raw[i] << 8) + (this.raw[i + 1] || 0);
    }
    checksum = (checksum & 0xFFFF) + (checksum >> 16);
    checksum = ~checksum & 0xFFFF;
    this.raw[10] = (checksum >> 8) & 0xFF;
    this.raw[11] = checksum & 0xFF;
  }

  setTotalLength(value, update = true) {
    const oldRaw = this.raw;
    this.raw = new Uint8Array(value);
    this.raw.set(oldRaw);

    this.raw[2] = (value >> 8) & 0xFF;
    this.raw[3] = value & 0xFF;

    if (update) {
      this.update();
    }
  }

  toString() {
    return `IPv4Packet(
  version=${this.version},
  ihl=${this.ihl},
  dscp=${this.dscp},
  ecn=${this.ecn},
  totalLength=${this.totalLength},
  identification=${this.identification}, 
  flags=${this.flags},
  fragmentOffset=${this.fragmentOffset},
  ttl=${this.ttl},
  protocol=${this.protocol},
  headerChecksum=0x${this.headerChecksum.toString(16)},
  src=${this.src.join('.')},
  dst=${this.dst.join('.')})
` + this.payload?.toString?.();
  }
}