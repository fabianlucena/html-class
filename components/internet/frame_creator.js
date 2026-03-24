import Frame from './frame.js';

export default function createFrame({ src, dst, payload, raw }) {
  const frame = new Frame({ src, dst, payload, raw });
  return frame;
}
