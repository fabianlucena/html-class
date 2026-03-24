export default class PacketPayload {
  get length() {
    return this.raw.length;
  }
}