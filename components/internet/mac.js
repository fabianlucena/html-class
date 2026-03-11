export function generateLocalMac() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);

  bytes[0] = (bytes[0] | 0x02) & 0xFE;

  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':');
}
