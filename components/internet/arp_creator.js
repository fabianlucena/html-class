import Arp from './arp.js';

export default function createArp({ raw }) {
  return new Arp({ raw });
}
