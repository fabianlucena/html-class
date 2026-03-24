import Icmp4 from './icmp4.js';

export default class Icmp4Echo extends Icmp4 {
  constructor({ payloadLength = 56, identifier = 0, sequenceNumber = 0, payload, raw } = {}) {
    super();
    if (raw) {
      this.raw = new Uint8Array(raw.length);
      this.raw.set(raw);
      this.raw[0] = this.defaultType;
      this.raw[1] = 0;
      this.update();
      return;
    }

    this.raw = new Uint8Array(8);
    this.raw[0] = this.defaultType;
    this.raw[1] = 0;

    if (payload) {
      this.setPayload(payload, false);
    } else if (typeof payloadLength === 'number') {
      this.setPayloadLength(payloadLength, false);
    }

    if (typeof identifier === 'number') {
      this.setIdentifier(identifier, false);
    }

    if (typeof sequenceNumber === 'number') {
      this.setSequenceNumber(sequenceNumber, false);
    }
    
    this.update();
  }

  get parentProtocol() {
    return 1; // ICMP
  }

  get type() {
    return this.raw[0];
  }

  get code() {
    return this.raw[1];
  }

  get identifier() {
    return (this.raw[4] << 8) | this.raw[5];
  }

  set identifier(value) {
    this.setIdentifier(value);
  }

  get sequenceNumber() {
    return (this.raw[6] << 8) | this.raw[7];
  }

  set sequenceNumber(value) {
    this.setSequenceNumber(value);
  }

  get payloadLength() {
    return this.raw.length - 8;
  }

  set payloadLength(length) {
    this.setPayLoadLength(length);
  }

  update() {
    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < this.raw.length; i += 2) {
      checksum += (this.raw[i] << 8) + (this.raw[i + 1] || 0);
    }
    checksum = (checksum & 0xFFFF) + (checksum >> 16);
    checksum = ~checksum & 0xFFFF;
    this.raw[2] = (checksum >> 8) & 0xFF;
    this.raw[3] = checksum & 0xFF;
  }

  setIdentifier(value, update = true) {
    if (value < 0 || value > 65535) {
      throw new Error('Identifier must be between 0 and 65535');
    }

    this.raw[4] = (value >> 8) & 0xFF;
    this.raw[5] = value & 0xFF;

    if (update) {
      this.update();
    }
  }

  setSequenceNumber(value, update = true) {
    if (value < 0 || value > 65535) {
      throw new Error('Sequence number must be between 0 and 65535');
    }

    this.raw[6] = (value >> 8) & 0xFF;
    this.raw[7] = value & 0xFF;

    if (update) {
      this.update();
    }
  }

  setPayloadLength(length, update = true) {
    if (length < 0 || length > 65527) {
      throw new Error('Payload length must be between 0 and 65527');
    }

    if (length === this.payloadLength) {
      return;
    }

    const oldRaw = this.raw;
    this.raw = new Uint8Array(8 + length);
    this.raw.set(oldRaw?.slice(0, 8));
    for (let i = 8, j = 0x61; i < this.raw.length; i++, j++) {
      this.raw[i] = j;
    }

    if (update) {
      this.update();
    }
  }

  setPayload(payload, update = true) {
    const length = payload.length;
    if (length < 0 || length > 65527) {
      throw new Error('Payload length must be between 0 and 65527');
    }

    const oldRaw = this.raw;
    this.raw = new Uint8Array(8 + length);
    this.raw.set(oldRaw?.slice(0, 8));
    this.raw.set(payload, 8);

    if (update) {
      this.update();
    }
  }

  toString() {
    const payloadHex = this.raw
      .slice(8)
      .reduce((lines, b, i) => {
        const hex = b.toString(16).padStart(2, '0');
        const groupIndex = Math.floor(i / 8);

        if (!lines[groupIndex])
          lines[groupIndex] = [];
        lines[groupIndex].push(hex);

        return lines;
      }, [])
      .map(group => group.join(' '))
      .join('\n    ');
    this.raw.slice(8).map(b => b.toString(16).padStart(2, '0')).join(' ')
    return `${this.constructor.name}(
  type=${this.type},
  code=${this.code},
  checksum=0x${((this.raw[2] << 8) | this.raw[3]).toString(16).padStart(4, '0')},
  identifier=${this.identifier},
  sequenceNumber=${this.sequenceNumber},
  payloadLength=${this.payloadLength},
  payload=
    ${payloadHex}
)`;
  }
}