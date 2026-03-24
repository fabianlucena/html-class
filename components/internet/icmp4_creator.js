import Icmp4EchoRequest from './icmp4_echo_request.js';
import Icmp4EchoReply from './icmp4_echo_reply.js';

export default function createIcmp4({ raw }) {
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