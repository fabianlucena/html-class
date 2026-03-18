import PacketPayload from './packet_payload.js';
import Icmp4EchoRequest from './icmp4_echo_request.js';
import Icmp4EchoReply from './icmp4_echo_reply.js';

export default class Icmp4 extends PacketPayload {
  get protocol() {
    return 1
  }

  static createFromRaw({ raw }) {
    const type = raw[0];
    switch (type) {
      case 0: // Echo Reply
        return new Icmp4EchoReply({ raw });
      case 8: // Echo Request
        return new Icmp4EchoRequest({ raw });
      default:
        throw new Error('Unsupported ICMP type');
    }
  }
}