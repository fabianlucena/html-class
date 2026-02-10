export function getPath(urlString) {
  let path;

  try {
    const fileUrl = new URL(urlString);
    path = fileUrl.pathname.substring(0, fileUrl.pathname.lastIndexOf('/'));
  } catch (error) {
    path = urlString.replace(/\/[^\/]*$/, '');
  }

  return path;
}