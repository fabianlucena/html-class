import Icmp6EchoReply from './icmp6_echo_reply.js';
import Icmp6Echo from './icmp6_echo.js';

export default class Icmp6EchoRequest extends Icmp6Echo {
  get defaultType() {
    return 128; // Type: Echo Request
  }
  
  toEchoReply() {
    return new Icmp6EchoReply({ raw: this.raw });
  }
}