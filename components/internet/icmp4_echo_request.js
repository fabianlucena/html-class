import Icmp4EchoReply from './icmp4_echo_reply.js';
import Icmp4Echo from './icmp4_echo.js';

export default class Icmp4EchoRequest extends Icmp4Echo {
  get defaultType() {
    return 8; // Type: Echo Request
  }

  toEchoReply() {
    return new Icmp4EchoReply({ raw: this.raw });
  }
}