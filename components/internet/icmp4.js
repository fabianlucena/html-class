import PacketPayload from './packet_payload.js';
import Icmp4EchoRequest from './icmp4_echo_request.js';

export default class Icmp4 extends PacketPayload {
  get protocol() {
    return 1
  }

  static createFromRaw({ raw }) {
    const type = raw[0];
    if (type === 8) { // Echo Request
      return new Icmp4EchoRequest({ raw });
    } else {
      throw new Error('Unsupported ICMP type');
    }
  }
}