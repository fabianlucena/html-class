import Icmp6 from './icmp6.js';

export default class Icmp6RouterAdvertisement extends Icmp6 {
  get defaultType() {
    return 134; // Type: Router Advertisement
  }
}