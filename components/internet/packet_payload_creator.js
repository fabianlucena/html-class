import createIcmp4 from './icmp4_creator.js';

export default function createPacketPayload({ packet, raw }) {
  if (packet.protocol === 1) {
    return createIcmp4({ raw });
  }

  throw new Error('Unsupported packet payload protocol');
}