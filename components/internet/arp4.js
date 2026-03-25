import FramePayload from './frame_payload.js';
import { ntop } from './ip_utils.js';

export default class Arp4 extends FramePayload {
  get parentProtocol() {
    return 0x0806;
  }

  constructor({
    senderMac = new Uint8Array(6).fill(0),
    senderIp,
    targetMac = new Uint8Array(6).fill(255),
    targetIp,
    opcode = 1,
    raw,
  } = {}) {
    super();

    if (raw) {
      this.raw = raw;
      return;
    }

    this.raw = new Uint8Array(28);
    this.raw[0] = 0x00;
    this.raw[1] = 0x01; // Ethernet
    this.raw[2] = 0x08;
    this.raw[3] = 0x00; // IPv4
    this.raw[4] = 6; // MAC address length
    this.raw[5] = 4; // IPv4 address length
    this.raw[6] = (opcode >> 8) & 0xFF;
    this.raw[7] = opcode & 0xFF;
    this.raw.set(senderMac, 8);
    this.raw.set(senderIp, 14);
    this.raw.set(targetMac, 18);
    this.raw.set(targetIp, 24);
  }

  get hardwareType() { // HTYPE = 0x0001 (Ethernet)
    return (this.raw[0] << 8) | this.raw[1];
  }
  
  get protocolType() { // PTYPE = 0x0800 (IPv4)
    return (this.raw[2] << 8) | this.raw[3];
  }

  get hardwareSize() { // HLEN = 6 (MAC address length)
    return this.raw[4];
  }
  
  get protocolSize() { // PLEN = 4 (IPv4 address length)
    return this.raw[5];
  }

  get opcode() { // OPER = 1 (ARP Request), 2 (ARP Reply)
    return (this.raw[6] << 8) | this.raw[7];
  }

  get senderMac() {
    return this.raw.slice(8, 14);
  }

  get senderIp() {
    return this.raw.slice(14, 18);
  }

  get targetMac() {
    return this.raw.slice(18, 24);
  }

  get targetIp() {
    return this.raw.slice(24, 28);
  }

  get isRequest() {
    return this.opcode === 1;
  }

  get isReply() {
    return this.opcode === 2;
  }

  toString() {
    return `ARP ${this.opcode === 1 ? 'Request' : 'Reply'}(
  hardwareType: ${this.hardwareType}
  protocolType: 0x${this.protocolType.toString(16)}
  hardwareSize: ${this.hardwareSize}
  protocolSize: ${this.protocolSize}
  opcode: ${this.opcode}
  src: ${ntop(this.senderIp)} (${ntop(this.senderMac)})
  dst: ${ntop(this.targetIp)} (${ntop(this.targetMac)})
)`;
  }

  getTypeLabel() {
    return this.isRequest ? 'ARP Request' : this.isReply ? 'ARP Reply' : 'ARP';
  }

  getSrcAddressLabel() {
    return ntop(this.senderIp);
  }

  getDstAddressLabel() {
    return ntop(this.targetIp);
  }
}