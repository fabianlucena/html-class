import Icmp6 from './icmp6.js';

export default class Icmp6NeighborAdvertisement extends Icmp6 {
  get defaultType() {
    return 136; // Type: Neighbor Advertisement
  }
}