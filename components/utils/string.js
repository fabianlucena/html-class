export function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

export function getDelimitedString(text, delimiter, options = { escape: '\\', skip: []}) {
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === options.escape) {
      result += char + text[i + 1];
      i++;
    } else if (text.substring(i, i + delimiter.length) === delimiter) {
      break;
    } else {
      result += char;
    }
  }

  return result;
}