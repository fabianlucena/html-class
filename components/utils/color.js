export function getColors(count, h = 90, s = 80, l = 60) {
  const colors = [];

  for (let i = 0; i < count; i++) {
    h = Math.floor(360 * i / count + h);
    const color = hsl2Hex(h, s, l);
    colors.push(color);
  }

  return colors;
}

export function hsl2Hex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}