import PacketPayload from './packet_payload.js';

export default class Icmp extends PacketPayload {
  type = 'icmp';
  protocol = 1;
}