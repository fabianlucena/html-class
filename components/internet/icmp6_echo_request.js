import Icmp6Echo from './icmp6_echo.js';

export default class Icmp6EchoRequest extends Icmp6Echo {
  get defaultType() {
    return 128; // Type: Echo Request
  }
}