import Icmp6Echo from './icmp6_echo.js';

export default class Icmp6EchoReply extends Icmp6Echo {
  get defaultType() {
    return 129; // Type: Echo Reply
  }
}