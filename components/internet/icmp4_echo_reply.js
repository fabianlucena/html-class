import Icmp4Echo from './icmp4_echo.js';

export default class Icmp4EchoReply extends Icmp4Echo {
  get defaultType() {
    return 0; // Type: Echo Reply
  }
}