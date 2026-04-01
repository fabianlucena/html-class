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

export function deepCopy(obj, options = {}) {
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
    options = {
      skipRecursive: true,
      maxDeep: 5,
      skipKeys: [],
      copyKeys: [],
      ...options,
    };

    if (options.maxDeep === 0) {
      return {};
    }

    options.maxDeep--;
    
    if (options.skipRecursive) {
      if (options.includedObjects?.has(obj)) {
        return {};
      }

      options.includedObjects ??= new Set();
      options.includedObjects.add(obj);
    }

    const copiedObj = {};
    for (let key in obj) {
      if (options.skipKeys.includes(key)) {
        console.log('--- ', key)
        continue;
      }

      if (options.copyKeys.includes(key)) {
        copiedObj[key] = obj[key];
        continue;
      }

      copiedObj[key] = deepCopy(obj[key], options);
    }
    return copiedObj;
  }
}
