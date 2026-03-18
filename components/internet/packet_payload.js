import Icmp from './icmp4.js';

export default class PacketPayload {
  static createFromRaw({ protocol, raw }) {
    if (protocol === 1) {
      return Icmp.createFromRaw({ raw });
    } else {
      throw new Error('Unsupported packet payload protocol');
    }
  }
}