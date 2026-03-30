import Icmp6DestinationUnreachable from './icmp6_destination_unreachable.js';
import Icmp6PacketTooBig from './icmp6_packet_too_big.js';
import Icmp6TimeExceeded from './icmp6_time_exceeded.js';
import Icmp6ParameterProblem from './icmp6_parameter_problem.js';
import Icmp6EchoRequest from './icmp6_echo_request.js';
import Icmp6EchoReply from './icmp6_echo_reply.js';
import Icmp6RouterSolicitation from './icmp6_router_solicitation.js';
import Icmp6RouterAdvertisement from './icmp6_router_advertisement.js';
import Icmp6NeighborSolicitation from './icmp6_neighbor_solicitation.js';
import Icmp6NeighborAdvertisement from './icmp6_neighbor_advertisement.js';
import Icmp6Redirect from './icmp6_redirect.js';

export default function createIcmp6({ raw, packet }) {
  const type = raw[0];
  switch (type) {
    case 1: // Destination Unreachable
      return new Icmp6DestinationUnreachable({ raw, packet });

    case 2: // Packet Too Big
      return new Icmp6PacketTooBig({ raw, packet });
    
    case 3: // Time Exceeded
      return new Icmp6TimeExceeded({ raw, packet });

    case 4: // Parameter Problem
      return new Icmp6ParameterProblem({ raw, packet });

    case 128: // Echo Request
      return new Icmp6EchoRequest({ raw, packet });

    case 129: // Echo Reply
      return new Icmp6EchoReply({ raw, packet });

    case 133: // Router Solicitation
      return new Icmp6RouterSolicitation({ raw, packet });

    case 134: // Router Advertisement
      return new Icmp6RouterAdvertisement({ raw, packet });

    case 135: // Neighbor Solicitation
      return new Icmp6NeighborSolicitation({ raw, packet });

    case 136: // Neighbor Advertisement
      return new Icmp6NeighborAdvertisement({ raw, packet });

    case 137: // Redirect
      return new Icmp6Redirect({ raw, packet });

    default:
      throw new Error('Unsupported ICMP type');
  }
}