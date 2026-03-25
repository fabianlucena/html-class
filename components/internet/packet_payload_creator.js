import createIcmp4 from './icmp4_creator.js';
import createIcmp6 from './icmp6_creator.js';

export default function createPacketPayload({ code, packet, raw }) {
  switch (code) {
    case 1: // ICMPv4
      return createIcmp4({ packet, raw });

    case 58: // ICMPv6
      return createIcmp6({ packet, raw });
  }

  throw new Error(`Unsupported packet payload protocol: ${packet.protocol}`);
}