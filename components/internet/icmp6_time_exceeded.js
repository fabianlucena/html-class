import Icmp6Error from './icmp6_error.js';

export default class Icmp6TimeExceeded extends Icmp6Error {
  get defaultType() {
    return 3; // Type: Time Exceeded
  }
}