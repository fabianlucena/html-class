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

export function assignDeep(target, ...sources) {
  for (let source of sources) {
    for (let key in source) {
      if (source[key] && typeof source[key] === 'object') {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        assignDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

export function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof Array) {
    return obj.map(deepCopy);
  }

  if (obj instanceof Object) {
    const copiedObj = {};
    for (let key in obj) {
      copiedObj[key] = deepCopy(obj[key]);
    }
    return copiedObj;
  }
}

export function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  if (a.constructor !== b.constructor) {
    return false;
  }

  if (a instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof Array) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (a instanceof Object) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let key of keysA) {
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  return false;
}