import PacketPayload from './packet_payload.js';

export default class Icmp4 extends PacketPayload {
  get parentProtocol() {
    return 1
  }
}