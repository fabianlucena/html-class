export function isHTMLElement(item) {
  return item instanceof HTMLElement;
}

export function escapeHTML(text) {
  if (!text)
    return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
