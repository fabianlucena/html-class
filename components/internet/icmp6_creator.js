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

export default function createIcmp6({ raw }) {
  const type = raw[0];
  switch (type) {
    case 1: // Destination Unreachable
      return new Icmp6DestinationUnreachable({ raw });
    
    case 2: // Packet Too Big
      return new Icmp6PacketTooBig({ raw });
    
    case 3: // Time Exceeded
      return new Icmp6TimeExceeded({ raw });

    case 4: // Parameter Problem
      return new Icmp6ParameterProblem({ raw });

    case 128: // Echo Request
      return new Icmp6EchoRequest({ raw });

    case 129: // Echo Reply
      return new Icmp6EchoReply({ raw });

    case 133: // Router Solicitation
      return new Icmp6RouterSolicitation({ raw });

    case 134: // Router Advertisement
      return new Icmp6RouterAdvertisement({ raw });

    case 135: // Neighbor Solicitation
      return new Icmp6NeighborSolicitation({ raw });

    case 136: // Neighbor Advertisement
      return new Icmp6NeighborAdvertisement({ raw });

    case 137: // Redirect
      return new Icmp6Redirect({ raw });

    default:
      throw new Error('Unsupported ICMP type');
  }
}