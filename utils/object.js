export function isEqual(a, b, options = { maxDeep: 10, skip: [], path: '' }) {
  const result = _isEqual(a, b, options);
  return result;
}

function _isEqual(a, b, options) {
  if (options.maxDeep <= 0)
    return true;

  if (a === b)
    return true;

  const path = options.path || '';
  if (options.trace || options.tracePath)
    console.log(path);
  
  if (options.skip.some(pattern => pattern.test(path))) {
    return true;
  }

  if (typeof a !== typeof b) {
    if (options.trace)
      console.log(`Type mismatch at ${path}: ${typeof a} vs ${typeof b}`);

    return false;
  }

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) {
      if (options.trace)
        console.log(`Array mismatch at ${path}: ${Array.isArray(a)} vs ${Array.isArray(b)}`);

      return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      if (options.trace)
        console.log(`Key length mismatch at ${path}: ${keysA.length} vs ${keysB.length}`);

      return false;
    }

    for (let key of keysA) {
      if (!keysB.includes(key)) {
        if (options.trace)
          console.log(`Missing key in B at ${path}: ${key}`);
      }

      if (!_isEqual(a[key], b[key], { ...options, maxDeep: options.maxDeep - 1, path: `${path}.${key}` })) {
        if (options.trace)
          console.log(`Value mismatch at ${path}.${key}: ${JSON.stringify(a[key])} vs ${JSON.stringify(b[key])}`);

        return false;
      }
    }
    
    return true;
  }

  if (options.trace)
    console.log(`Value mismatch at ${path}: ${a} vs ${b}`);

  return false;
}

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
    if (!(part in current)) {
      return undefined;
    }
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

export function doesExtend(subClass, superClass) {
  if (typeof subClass !== 'function' || typeof superClass !== 'function')
    return false;

  let current = subClass;
  while (current) {
    if (current === superClass)
      return true;
    
    current = Object.getPrototypeOf(current);
  }

  return false;
}