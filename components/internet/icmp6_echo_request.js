import Icmp6 from './icmp6.js';

export default class Icmp6EchoRequest extends Icmp6 {
  get defaultType() {
    return 128; // Type: Echo Request
  }
}