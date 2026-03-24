import IPv4Packet from './ipv4_packet.js';
import IPv6Packet from './ipv6_packet.js';
import PacketPayload from './packet_payload.js';

export default function createPacket({ src, dst, payload, raw, ttl }) {
  if (raw) {
    return createFromRaw({ raw });
  }

  if (!src || !dst || !payload) {
    throw new Error('Source, destination, and payload are required');
  }

  if (src.length !== dst.length) {
    throw new Error('Source and destination must have the same length');
  }

  if (!(payload instanceof PacketPayload)) {
    throw new Error('Payload must be an instance of PacketPayload');
  }

  if (dst.length === 4) {
    return new IPv4Packet({ src, dst, payload, ttl });
  } else if (dst.length === 16) {
    return new IPv6Packet({ src, dst, payload, ttl });
  } else {
    throw new Error('Source and destination must be IPv4 or IPv6 addresses');
  }
}

function createFromRaw({ raw }) {
  const version = (raw[0] >> 4) & 0xF;
  if (version === 4) {
    return new IPv4Packet({ raw });
  }
  
  if (version === 6) {
    return new IPv6Packet({ raw });
  }
  
  throw new Error('Invalid IP version in raw data');
}