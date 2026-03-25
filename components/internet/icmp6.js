import PacketPayload from './packet_payload.js';

export default class Icmp6 extends PacketPayload {
  get parentNextHeader() {
    return 0x3A;
  }

  get type() {
    return this.raw[0];
  }

  get code() {
    return this.raw[1];
  }

  get checksum() {
    return (this.raw[2] << 8) | this.raw[3];
  }
}