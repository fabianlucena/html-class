import createIcmp6 from './icmp6_creator.js';

export default function createIPv6PacketPayload({ packet, raw }) {
  console.log(packet.toString());
  switch (packet.nextHeader) {
    case 58: // ICMPv6
      return createIcmp6({ raw });
  }

  throw new Error(`Unsupported packet payload protocol: ${packet.protocol}`);
}