const isVite = typeof import.meta !== 'undefined' && import.meta.env;

export function importCss(url, file) {
  if (file) {
    const fileUrl = new URL(file);
    const currentDir = fileUrl.pathname.substring(0, fileUrl.pathname.lastIndexOf('/'));
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    url = currentDir + url;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

export async function loadTextCss(url) {
  try {
    if (isVite) {
      const mod = await import(/* @vite-ignore */ url + '?raw');
      if (mod && mod.default) {
        return mod.default;
      }
    }
  } catch {}

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to load file: ${res.status} ${res.statusText}`);

  return res.text();
}