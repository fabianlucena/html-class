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

    this.raw = new Uint8Array(46);
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

  // HTYPE = 0x0001 (Ethernet)
  get hardwareType() {
    return (this.raw[0] << 8) | this.raw[1];
  }
  
  // PTYPE = 0x0800 (IPv4)
  get protocolType() {
    return (this.raw[2] << 8) | this.raw[3];
  }

  // HLEN = 6 (MAC address length)
  get hardwareSize() {
    return this.raw[4];
  }
  
  // PLEN = 4 (IPv4 address length)
  get protocolSize() {
    return this.raw[5];
  }

  // OPER = 1 (ARP Request), 2 (ARP Reply)
  get opcode() {
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
    return `ARP ${this.opcode === 1 ? 'Request' : 'Reply'}: ${ntop(this.senderIp)} (${ntop(this.senderMac)}) -> ${ntop(this.targetIp)} (${ntop(this.targetMac)})`;
  }
}