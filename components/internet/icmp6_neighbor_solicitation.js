import Icmp6 from './icmp6.js';

export default class Icmp6NeighborSolicitation extends Icmp6 {
  get defaultType() {
    return 135; // Type: Neighbor Solicitation
  }
}