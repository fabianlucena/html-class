import createFramePayload from './frame_payload_creator.js';
import FramePayload from './frame_payload.js';
import { ntop, crc32Ethernet } from './ip_utils.js';

export default class Frame {
  constructor({ src, dst, payload, raw }) {
    if (raw) {
      if (Array.isArray(raw)) {
        raw = new Uint8Array(raw);
      }

      this.raw = raw;
      if (raw.length < 18) {
        throw new Error('Frame must be at least 18 bytes long');
      }

      const fcs = crc32Ethernet(this.raw.slice(0, this.raw.length - 4));
      if (fcs.some((b, i) => b !== this.fcs[i])) {
        console.error('Invalid FCS', fcs, this.fcs, raw);
        throw new Error('Invalid FCS');
      }

      this.payload = createFramePayload({ raw: raw.slice(14, raw.length - 4), frame: this });
      return;
    }

    if (!payload) {
      throw new Error('Payload is required');
    }

    if (!(payload instanceof FramePayload)) {
      throw new Error('Payload must be an instance of FramePayload');
    }

    this.create({ src, dst, payload });
  }

  get dst() {
    return this.raw.slice(0, 6);
  }

  get src() {
    return this.raw.slice(6, 12);
  }

  get protocol() {
    return (this.raw[12] << 8) | this.raw[13];
  }

  get fcs() {
    return this.raw.slice(this.raw.length - 4);
  }

  create({ src, dst, payload }) {
    if (this.raw) {
      throw new Error('Frame is already created');
    }

    if (src.length !== 6 || dst.length !== 6) {
      throw new Error('Source and destination must be MAC addresses');
    }

    if (!payload?.raw || !payload.parentProtocol) {
      throw new Error('Payload must include raw and parentProtocol');
    }

    this.payload = payload;

    this.raw = new Uint8Array(Math.max(14 + payload.raw.length + 4, 64));
    this.raw.set(dst, 0);
    this.raw.set(src, 6);
    this.raw.set([this.payload.parentProtocol >> 8, this.payload.parentProtocol & 0xFF], 12);
    this.raw.set(this.payload.raw, 14);
    
    this.update();
  }

  update() {
    const fcs = crc32Ethernet(this.raw.slice(0, this.raw.length - 4));
    fcs.forEach((b, i) => {
      this.raw[this.raw.length - 4 + i] = b;
    });
  }

  toString() {
    let result = `Frame(
  dst: ${[...this.dst].map(b => b.toString(16).padStart(2, '0')).join(':')}
  src: ${[...this.src].map(b => b.toString(16).padStart(2, '0')).join(':')}
  protocol: 0x${this.protocol.toString(16)}
  size: ${this.raw.length} bytes
  fcs: ${[...this.fcs].map(b => b.toString(16).padStart(2, '0')).join(' ')}
)
`;

    result += this.payload?.toString?.();

    return result;
  }

  getTypeLabel() {
    return this.payload?.getTypeLabel?.()
      || this.payload?.constructor.name
      || this.constructor.name;
  }

  getSrcAddressLabel() {
    let label = this.payload?.getSrcAddressLabel?.();
    if (label) {
      label += ` (${ntop(this.src)})`;
    }

    return label;
  }

  getDstAddressLabel() {
    let label = this.payload?.getDstAddressLabel?.();
    if (label) {
      label += ` (${ntop(this.dst)})`;
    }

    return label;
  }
}