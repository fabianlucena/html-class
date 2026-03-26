import createPacket from './packet_creator.js';
import createArp from './arp_creator.js';

export default function createFramePayload({ raw, frame }) {
  switch (frame.protocol) {
    case 0x0806:
      return createArp({ raw });

    case 0x0800:
    case 0x86DD:
      return createPacket({ raw });
  }
}