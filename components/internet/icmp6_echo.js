import Icmp6 from './icmp6.js';

export default class Icmp6Echo extends Icmp6 {
  #packet;

  constructor({ payloadLength = 56, identifier = 0, sequenceNumber = 0, payload, raw, packet } = {}) {
    super();

    if (packet) {
      this.setPacket(packet, false);
    }

    if (raw) {
      this.raw = new Uint8Array(raw.length);
      this.raw.set(raw);
      if (this.calculateChecksum() !== this.checksum) {
        console.error('Invalid checksum', this.calculateChecksum(), this.checksum);
        throw new Error('Invalid checksum');
      }
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

  get packet() {
    return this.#packet;
  }

  set packet(value) {
    this.setPacket(value);
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

  get checksum() {
    return (this.raw[2] << 8) | this.raw[3];
  }
  
  get payloadLength() {
    return this.raw.length - 8;
  }

  set payloadLength(length) {
    this.setPayLoadLength(length);
  }

  setPacket(value, update = true) {
    this.#packet = value;
    if (update) {
      this.update();
    }
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

  calculateChecksum() {
    if (!this.#packet) {
      return 0;
    }
    
    let checksum = 0;
    for (let i = 0; i < 32; i += 2) {
      checksum += (this.#packet.raw[i] << 8) + (this.raw[i + 1] || 0);
    }
    checksum += this.raw.length; // Upper layer packet length
    checksum += 58; // Next Header
    checksum += (this.#packet.raw[0] << 8) + (this.raw[1] || 0);

    for (let i = 4; i < this.raw.length; i += 2) {
      checksum += (this.#packet.raw[i] << 8) + (this.raw[i + 1] || 0);
    }

    checksum = (checksum & 0xFFFF) + (checksum >> 16);
    checksum = ~checksum & 0xFFFF;
    return checksum;
  }

  update() {
    let checksum = this.calculateChecksum();
    this.raw[2] = (checksum >> 8) & 0xFF;
    this.raw[3] = checksum & 0xFF;
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
  checksum=0x${this.checksum.toString(16).padStart(4, '0')},
  identifier=${this.identifier},
  sequenceNumber=${this.sequenceNumber},
  payloadLength=${this.payloadLength},
  payload=
    ${payloadHex}
)`;
  }
}