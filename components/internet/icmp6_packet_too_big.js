import Icmp6Error from './icmp6_error.js';

export default class Icmp6PacketTooBig extends Icmp6Error {
  get defaultType() {
    return 2; // Type: Packet Too Big
  }
}