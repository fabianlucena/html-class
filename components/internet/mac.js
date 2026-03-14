export function generateLocalMac() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);

  bytes[0] = (bytes[0] | 0x02) & 0xFE;

  return bytes;
}

export function macToStr(mac) {
  if (!mac)
    return null;

  return Array.from(mac)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':');
}

export function strToMac(str) {
  if (!str)
    return null;

  const bytes = str.split(':').map(b => parseInt(b, 16));
  if (bytes.length !== 6 || bytes.some(b => isNaN(b) || b < 0 || b > 255))
    throw new Error('Invalid MAC address string');

  return new Uint8Array(bytes);
}