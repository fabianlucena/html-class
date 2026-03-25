export function ntop(ip) {
  if (!(ip instanceof Uint8Array)) {
    throw new Error('Invalid IP address');
  }

  if (ip.length === 4) {
    return Array.from(ip)
      .map(b => b.toString())
      .join('.');
  }

  if (ip.length === 16) {
    const parts = [];
    for (let i = 0; i < 16; i += 2) {
      const part = (ip[i] << 8) | ip[i + 1];
      parts.push(part.toString(16));
    }

    let bestStart = -1;
    let bestLen = 0;

    let currentStart = -1;
    let currentLen = 0;

    for (let i = 0; i < 8; i++) {
      if (parts[i] === '0') {
        if (currentStart === -1) {
          currentStart = i;
          currentLen = 1;
        } else {
          currentLen++;
        }
      } else {
        if (currentLen > bestLen) {
          bestStart = currentStart;
          bestLen = currentLen;
        }
        currentStart = -1;
        currentLen = 0;
      }
    }

    if (currentLen > bestLen) {
      bestStart = currentStart;
      bestLen = currentLen;
    }

    if (bestLen >= 2) {
      const before = parts.slice(0, bestStart);
      const after = parts.slice(bestStart + bestLen);

      return [
        before.join(':'),
        '',
        after.join(':')
      ].join(':').replace(/(^:|:$)/, '::').replace(/:::/g, '::');
    }

    return parts.join(':');
  }

  if (ip.length === 6) {
    return Array.from(ip)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':');
  }

  throw new Error('Invalid IP address');
}

export function pton(str) {
  if (!str)
    return;

  let parts4 = str.split('.').map(Number);
  if (parts4.length === 4 && !parts4.some(p => isNaN(p) || p < 0 || p > 255)) {
    return new Uint8Array(parts4);
  }

  let hexParts = str.split(':');

  let emptyIndex = hexParts.indexOf('');
  if (emptyIndex !== -1) {
    if (emptyIndex === 0 && hexParts[1] === '') {
      hexParts.splice(0, 2, '');
    } else if (emptyIndex === hexParts.length - 2 && hexParts[hexParts.length - 1] === '') {
      hexParts.splice(hexParts.length - 2, 2, '');
    }

    const missing = 8 - (hexParts.length - 1);
    const expanded = [];

    for (let i = 0; i < hexParts.length; i++) {
      if (hexParts[i] === '') {
        for (let j = 0; j < missing; j++) expanded.push('0');
      } else {
        expanded.push(hexParts[i]);
      }
    }

    hexParts = expanded;
  }

  if (hexParts.length !== 8) {
    throw new Error('Invalid IPv6 address');
  }

  const bytes = new Uint8Array(16);

  for (let i = 0; i < 8; i++) {
    const part = parseInt(hexParts[i], 16);
    if (isNaN(part) || part < 0 || part > 0xFFFF) {
      throw new Error('Invalid IPv6 group');
    }
    bytes[i * 2] = (part >> 8) & 0xFF;
    bytes[i * 2 + 1] = part & 0xFF;
  }

  return bytes;
}

export function maskToPrefix(mask) {
  if (!mask)
    return;

  let bits = 0;
  for (const byte of mask) {
    if (byte === 0xFF) {
      bits += 8;
    } else {
      let b = byte;
      while (b & 0x80) {
          bits++;
          b <<= 1;
      }
      break;
    }
  }

  return bits;
}

export function prefixToMask(prefix, length = 4) {
  const bytes = new Uint8Array(prefix > 32 ? 16 : length);
  for (let i = 0; i < bytes.length; i++) {
    if (prefix >= 8) {
      bytes[i] = 0xFF;
      prefix -= 8;
    } else if (prefix > 0) {
      bytes[i] = (0xFF << (8 - prefix)) & 0xFF;
      break;
    }
  }

  return bytes;
}

export function ipToBrd(address, netmask) {
  if (address.length !== netmask.length) {
    throw new Error('Address and netmask length mismatch');
  }

  const broadcast = new Uint8Array(address.length);
  for (let i = 0; i < address.length; i++) {
    broadcast[i] = address[i] | (~netmask[i] & 0xFF);
  }

  return broadcast;
}

export function applyMask(address, netmask) {
  if (address.length !== netmask.length) {
    throw new Error('Address and netmask length mismatch');
  }

  const result = new Uint8Array(address.length);
  for (let i = 0; i < address.length; i++) {
    result[i] = address[i] & netmask[i];
  }

  return result;
}

export function getAddressMaskPrefix({ ip, address, prefix, netmask }) {
  if (!address) {
    if (!ip) {
      return { error: 'Invalid IP address is required' };
    }
    
    let tryPrefix; 
    [address, tryPrefix] = ip.split('/');
    if (typeof tryPrefix !== 'undefined') {
      prefix = tryPrefix;
    }

    address = pton(address);
  } else if (typeof address === 'string') {
    address = pton(address);
  }

  if (address.length !== 4 && address.length !== 16) {
    return { error: 'Invalid IP address length' };
  }

  if (!netmask) {
    if (typeof prefix === 'undefined') {
      return { error: 'Netmask or prefix is required' };
    }

    prefix = parseInt(prefix);
    netmask ??= prefixToMask(prefix, address.length);
  } else if (typeof netmask === 'string') {
    netmask = pton(netmask);
    if (typeof prefix === 'undefined') {
      prefix = maskToPrefix(netmask);
    }
  }

  if (!netmask || !prefix) {
    return { error: 'Netmask or prefix is required' };
  }

  if (netmask.length !== address.length) {
    return { error: 'Incompatible IP address and netmask lengths' };
  }

  return {
    address: address,
    prefix: prefix,
    netmask: netmask,
  };
}

export function isIPv4(address) {
  return address.length === 4;
}

export function isIPv6(address) {
  return address.length === 16;
}

export function isInSubnet(addr, subnet) {
  if (!addr || !subnet || !subnet.address || !subnet.netmask) {
    return false;
  }

  if (addr.length !== subnet.address.length) {
    return false;
  }
  
  const maskedAddr = applyMask(addr, subnet.netmask);

  return maskedAddr.every((byte, index) => byte === subnet.address[index]);
}

export function isEqualIPv4AddressMask(
  { address: address1, netmask: netmask1, prefix: prefix1 },
  { address: address2, netmask: netmask2, prefix: prefix2 }
) {
  if (!address1 || !address2
    || address1.length !== 4 || address2.length !== 4
  ) {
    return false;
  }

  if (netmask1?.length !== 4) {
    if (typeof (prefix1) === 'undefined') {
      return false;
    }

    netmask1 = prefixToMask(prefix1, 4);
  }

  if (netmask2?.length !== 4) {
    if (typeof (prefix2) === 'undefined') {
      return false;
    }

    netmask2 = prefixToMask(prefix2, 4);
  }
  
  return address1.every((byte, index) => byte === address2[index])
    && netmask1.every((byte, index) => byte === netmask2[index]);
}

export function isEqualIPv6AddressMask(
  { address: address1, netmask: netmask1, prefix: prefix1 },
  { address: address2, netmask: netmask2, prefix: prefix2 }
) {
  if (!address1 || !address2
    || address1.length !== 16 || address2.length !== 16
  ) {
    return false;
  }

  if (typeof (prefix1) === 'undefined') {
    if (netmask1?.length !== 16) {
      return false;
    }

    prefix1 = maskToPrefix(netmask1);
  }

  if (prefix1 < 0 || prefix1 > 128) {
    return false;
  }
  
  if (typeof (prefix2) === 'undefined') {
    if (netmask2?.length !== 16) {
      return false;
    }

    prefix2 = maskToPrefix(netmask2);
  }

  if (prefix2 !== prefix1) {
    return false;
  }

  return address1.every((byte, index) => byte === address2[index]);
}

// Tabla CRC32 (polinomio reflejado 0xEDB88320)
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

// Calcula CRC32 estilo Ethernet (FCS)
export function crc32Ethernet(bytes) {
  let crc = 0xFFFFFFFF;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const idx = (crc ^ b) & 0xFF;
    crc = (crc >>> 1) ^ crcTable[idx];
  }

  crc = crc ^ 0xFFFFFFFF;

  // Ethernet envía el CRC en little-endian
  return new Uint8Array([
    crc & 0xFF,
    (crc >>> 8) & 0xFF,
    (crc >>> 16) & 0xFF,
    (crc >>> 24) & 0xFF
  ]);
}