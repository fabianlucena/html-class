export function getPath(urlString) {
  const fileUrl = new URL(urlString);
  const currentDir = fileUrl.pathname.substring(0, fileUrl.pathname.lastIndexOf('/'));
  
  return currentDir;
}
