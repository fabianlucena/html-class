import PacketPayload from './packet_payload.js';
import IcmpEchoRequest from './icmp_echo_request.js';

export default class Icmp extends PacketPayload {
  type = 'icmp';
  protocol = 1;

  static createFromRaw({ raw }) {
    const type = raw[0];
    console.log('ICMP type:', type);
    console.log('ICMP raw:', raw);
    if (type === 8) { // Echo Request
      return IcmpEchoRequest.createFromRaw({ raw });
    } else {
      throw new Error('Unsupported ICMP type');
    }
  }
}