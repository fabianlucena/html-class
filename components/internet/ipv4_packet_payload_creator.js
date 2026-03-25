import createIcmp4 from './icmp4_creator.js';

export default function createIPv4PacketPayload({ packet, raw }) {
  switch (packet.protocol) {
    case 1: // ICMPv4
      return createIcmp4({ raw });
  }

  throw new Error(`Unsupported packet payload protocol: ${packet.protocol}`);
}