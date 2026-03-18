import Icmp from './icmp4.js';

export default class PacketPayload {
  get length() {
    return this.raw.length;
  }
  
  static createFromRaw({ protocol, raw }) {
    if (protocol === 1) {
      return Icmp.createFromRaw({ raw });
    } else {
      throw new Error('Unsupported packet payload protocol');
    }
  }
}