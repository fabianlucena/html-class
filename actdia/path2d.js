export function transformPathD(d, { sx = 1, sy = 1, x = 0, y = 0 }) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);  if (!tokens) return '';
  if (!tokens)
    return '';

  const result = [];
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i++];
    const upper = cmd.toUpperCase();
    const isRelative = cmd !== upper;
    const paramCount = {
      M: 2, L: 2, T: 2,
      H: 1, V: 1,
      C: 6, S: 4, Q: 4,
      A: 7,
      Z: 0, z: 0
    }[upper];

    if (typeof paramCount === 'undefined')
      continue;

    result.push(cmd);

    while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
      const group = [];
      for (let j = 0; j < paramCount && i < tokens.length; j++) {
        group.push(parseFloat(tokens[i++]));
      }
      
      const transformed = isRelative ?
        transformCommand(upper, group, sx, sy, 0, 0) :
        transformCommand(upper, group, sx, sy, x, y);
      
      result.push(...transformed.map(n => +n.toFixed(2)));
    }
  }

  return result.join(' ');
}

function transformCommand(cmd, p, sx, sy, x, y) {
  switch (cmd) {
    case 'M':
    case 'L':
    case 'T':
      return [p[0] * sx + x, p[1] * sy + y];
    case 'H':
      return [p[0] * sx + x];
    case 'V':
      return [p[0] * sy + y];
    case 'C':
      return [
        p[0] * sx + x, p[1] * sy + y,
        p[2] * sx + x, p[3] * sy + y,
        p[4] * sx + x, p[5] * sy + y,
      ];
    case 'S':
    case 'Q':
      return [
        p[0] * sx + x, p[1] * sy + y,
        p[2] * sx + x, p[3] * sy + y,
      ];
    case 'A':
      return [
        p[0] * sx, p[1] * sy,
        p[2],
        p[3], p[4],
        p[5] * sx + x, p[6] * sy + y,
      ];
    default:
      return [];
  }
}