import FramePayload from './frame_payload.js';
import createPacketPayload from './packet_payload_creator.js';
import { ntop } from './ip_utils.js';

export default class IPv6Packet extends FramePayload {
  constructor({
    raw,
    src,
    dst,
    payload,
    ttl,
    hopLimit
  }) {
    super();

    if (raw) {
      this.raw = raw;
      this.payload = createPacketPayload({ code: this.nextHeader, packet: this, raw: raw.slice(this.headerLength) });
      return;
    }

    this.create({ src, dst, payload, ttl, hopLimit });
  }

  get parentProtocol() {
    return 0x86DD;
  }

  get version() {
    return (this.raw[0] >> 4) & 0xF;
  }

  get trafficClass() {
    return ((this.raw[0] & 0xF) << 4) | (this.raw[1] >> 4);
  }

  get flowLabel() {
    return ((this.raw[1] & 0xF) << 16) | (this.raw[2] << 8) | this.raw[3];
  }

  get payloadLength() {
    return (this.raw[4] << 8) | this.raw[5];
  }

  get nextHeader() {
    return this.raw[6];
  }

  get protocol() {
    return this.raw[6];
  }

  get hopLimit() {
    return this.raw[7];
  }
  
  get src() {
    return this.raw.slice(8, 24);
  }

  get dst() {
    return this.raw.slice(24, 40);
  }

  get headerLength() {
    return 40;
  }

  create({ src, dst, payload, ttl, hopLimit }) {
    if (this.raw) {
      throw new Error('Packet is already created');
    }

    if (!src || !dst) {
      throw new Error('Source and destination must be provided');
    }

    if (src.length !== 16 || dst.length !== 16) {
      throw new Error('Source and destination must be IPv6 addresses');
    }

    if (!payload) {
      throw new Error('Payload must be provided');
    }

    if (typeof hopLimit !== 'undefined') {
      if (typeof hopLimit !== 'number') {
        throw new Error('Hop limit must be a number');
      }

      if (typeof ttl !== 'undefined') {
        throw new Error('Either TTL or Hop Limit must be provided');
      }
    } else if (typeof ttl !== 'undefined') {
      if (typeof ttl !== 'number') {
        throw new Error('TTL must be a number');
      }
    }

    this.payload = payload;

    const totalLength = 40 + (payload?.raw.length || 0);

    this.raw = new Uint8Array(totalLength);
    this.raw[0] = 0x60; // Version
    this.raw[1] = 0; // Traffic Class
    this.raw[2] = 0; // Flow Label
    this.raw[3] = 0;
    this.raw[4] = (payload?.raw.length >> 8) & 0xFF;
    this.raw[5] = payload?.raw.length & 0xFF;
    this.raw[6] = payload?.parentNextHeader; // Next Header (ICMP)
    this.raw[7] = hopLimit ?? ttl ?? 64; // Hop Limit
    this.raw.set(src, 8);
    this.raw.set(dst, 24);
    this.raw.set(this.payload?.raw, 40);

    this.update();
  }

  update() {
    if (this.payload) {
      this.payload.packet = this;

      const totalLength = 40 + (this.payload?.raw.length || 0);
      if (this.raw.length !== totalLength) {
        const oldRaw = this.raw;
        this.raw = new Uint8Array(totalLength);
        this.raw.set(oldRaw.slice(0, 40), 0);
      }
      this.raw[4] = (this.payload.raw.length >> 8) & 0xFF;
      this.raw[5] = this.payload.raw.length & 0xFF;
      this.raw.set(this.payload?.raw, 40);
    }
  }

  toString() {
    return `IPv6Packet(
  Version: ${this.version}
  Traffic class: ${this.trafficClass}
  Flow label: ${this.flowLabel}
  Payload length: ${this.payloadLength}
  Next header: ${this.nextHeader}
  Hop limit: ${this.hopLimit}
  Source: ${ntop(this.src)}
  Destination: ${ntop(this.dst)}
)
` + this.payload?.toString?.();
  }
  
  getTypeLabel() {
    return this.payload?.getTypeLabel?.()
      || this.payload?.constructor.name
      || this.constructor.name;
  }

  getSrcAddressLabel() {
    return ntop(this.src);
  }

  getDstAddressLabel() {
    return ntop(this.dst);
  }
}