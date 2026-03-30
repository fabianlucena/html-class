import PacketPayload from './packet_payload.js';

export default class Icmp6 extends PacketPayload {
  #packet;

  get packet() {
    return this.#packet;
  }

  set packet(value) {
    this.setPacket(value);
  }
  
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

  setPacket(value, update = true) {
    this.#packet = value;
    if (update) {
      this.update();
    }
  }
  
  calculateChecksum() {
    if (!this.#packet) {
      return 0;
    }
    
    const packet = this.#packet;
    const raw = this.raw;
    let checksum = 0;
    for (let i = 0; i < 32; i += 2) {
      checksum += (packet.raw[i] << 8) + (packet.raw[i + 1] || 0);
    }
    checksum += raw.length; // Upper layer packet length
    checksum += 58; // Next Header

    checksum += (raw[0] << 8) + (raw[1] || 0);

    for (let i = 4; i < raw.length; i += 2) {
      checksum += (raw[i] << 8) + (raw[i + 1] || 0);
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
}