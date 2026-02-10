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
