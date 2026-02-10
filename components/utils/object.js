export function deletePropertyByPath(obj, path) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  let current = obj;
  for (let part of parts) {
    if (!(part in current)) {
      return;
    }
    current = current[part];
  }
  delete current[lastPart];
}

export function getValueByPath(obj, path) {
  const parts = path
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.');

  let current = obj;
  for (let part of parts) {
    if (!(part in current))
      return;

    current = current[part];
  }
   
  return current;
}

export function setValueByPath(obj, path, value) {
  const parts = path
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.');

  const lastPart = parts.pop();
  let current = obj;
  for (let part of parts) {
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  current[lastPart] = value;
}