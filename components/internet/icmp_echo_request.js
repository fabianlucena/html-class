import Icmp from './icmp.js';

export default class IcmpEchoRequest extends Icmp {
  constructor({ payloadLength = 56, identifier = 0, sequenceNumber = 0 } = {}) {
    super();
    this.payloadLength = payloadLength;
    this.identifier = identifier;
    this.sequenceNumber = sequenceNumber;
    this.create();
  }

  create() {
    this.payload = new Uint8Array(8 + this.payloadLength);
    this.payload[0] = 8; // Type: Echo Request
    this.payload[1] = 0;
    this.payload[4] = (this.identifier >> 8) & 0xFF; // Identifier
    this.payload[5] = this.identifier & 0xFF;
    this.payload[6] = (this.sequenceNumber >> 8) & 0xFF; // Sequence Number
    this.payload[7] = this.sequenceNumber & 0xFF;
    for (let i = 8; i < this.payload.length; i++) {
      this.payload[i] = i - 8;
    }

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < this.payload.length; i += 2) {
      checksum += (this.payload[i] << 8) + (this.payload[i + 1] || 0);
    }
    checksum = (checksum & 0xFFFF) + (checksum >> 16);
    checksum = ~checksum & 0xFFFF;
    this.payload[2] = (checksum >> 8) & 0xFF;
    this.payload[3] = checksum & 0xFF;
  }
}