import createFramePayload from './frame_payload_creator.js';
import FramePayload from './frame_payload.js';
import { ntop } from './ip_utils.js';

export default class Frame {
  constructor({ src, dst, payload, raw }) {
    if (raw) {
      if (Array.isArray(raw)) {
        raw = new Uint8Array(raw);
      }

      this.raw = raw;
      this.payload = createFramePayload({ raw: raw.slice(14), frame: this });
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

    this.raw = new Uint8Array(14 + payload.raw.length);
    this.raw.set(dst, 0);
    this.raw.set(src, 6);
    this.raw.set([this.payload.parentProtocol >> 8, this.payload.parentProtocol & 0xFF], 12);
    this.raw.set(this.payload.raw, 14);
  }

  toString() {
    let result = `Frame(
  dst=${[...this.dst].map(b => b.toString(16).padStart(2, '0')).join(':')},
  src=${[...this.src].map(b => b.toString(16).padStart(2, '0')).join(':')},
  protocol=0x${this.protocol.toString(16)}
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