import Icmp6Error from './icmp6_error.js';

export default class Icmp6DestinationUnreachable extends Icmp6Error {
  get defaultType() {
    return 1; // Type: Destination Unreachable
  }
}