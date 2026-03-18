import Icmp4 from './icmp4.js';

export default class Icmp4EchoReply extends Icmp4 {
  constructor({ request } = {}) {
    super();
    this.create({ request });
  }

  /*static createFromRaw({ raw }) {
    const identifier = (raw[4] << 8) | raw[5];
    const sequenceNumber = (raw[6] << 8) | raw[7];
    const payloadLength = raw.length - 8;
    return new IcmpEchoReply({ payloadLength, identifier, sequenceNumber });
  }*/

  /*create({ request }) {
    this.raw = new Uint8Array(8 + this.payloadLength);
    this.raw[0] = 0; // Type: Echo Reply
    this.raw[1] = 0;
    this.raw[4] = (this.identifier >> 8) & 0xFF; // Identifier
    this.raw[5] = this.identifier & 0xFF;
    this.raw[6] = (this.sequenceNumber >> 8) & 0xFF; // Sequence Number
    this.raw[7] = this.sequenceNumber & 0xFF;
    for (let i = 8; i < this.raw.length; i++) {
      this.raw[i] = i - 8;
    }

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < this.raw.length; i += 2) {
      checksum += (this.raw[i] << 8) + (this.raw[i + 1] || 0);
    }
    checksum = (checksum & 0xFFFF) + (checksum >> 16);
    checksum = ~checksum & 0xFFFF;
    this.raw[2] = (checksum >> 8) & 0xFF;
    this.raw[3] = checksum & 0xFF;
  }*/
}