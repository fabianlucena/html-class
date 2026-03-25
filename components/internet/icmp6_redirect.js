import Icmp6 from './icmp6.js';

export default class Icmp6Redirect extends Icmp6 {
  get defaultType() {
    return 137; // Type: Redirect
  }
}