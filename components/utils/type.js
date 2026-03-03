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

export function isEqual(a, b, options = { maxDeep: 10, skip: [], path: '' }) {
  const result = _isEqual(a, b, options);
  return result;
}

function _isEqual(a, b, options) {
  if (a === b) {
    return true;
  }

  if (options.maxDeep <= 0) {
    return true;
  }

  const path = options.path || '';
  if (options.trace || options.tracePath)
    console.log(path);
  
  if (options.skip.some(pattern => pattern.test(path))) {
    return true;
  }

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    if (options.trace)
      console.log(`Primitive mismatch at ${path}: ${a} vs ${b}`);

    return false;
  }

  if (typeof a !== typeof b) {
    if (options.trace)
      console.log(`Type mismatch at ${path}: ${typeof a} vs ${typeof b}`);

    return false;
  }

  if (a.constructor !== b.constructor) {
    if (options.trace)
      console.log(`Constructor mismatch at ${path}: ${a.constructor} vs ${b.constructor}`);

    return false;
  }

  if (a instanceof Date) {
    if (a.getTime() === b.getTime()) {
      return true;
    } else {
      if (options.trace)
        console.log(`Date mismatch at ${path}: ${a.getTime()} vs ${b.getTime()}`);
      
      return false;
    }
  }

  if (a instanceof Array) {
    if (a.length !== b.length) {
      if (options.trace)
        console.log(`Array length mismatch at ${path}: ${a.length} vs ${b.length}`);
      
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!_isEqual(a[i], b[i], options)) {
        if (options.trace)
          console.log(`Value mismatch at ${path}.${i}: ${JSON.stringify(a[i])} vs ${JSON.stringify(b[i])}`);

        return false;
      }
    }

    return true;
  }

  if (a instanceof Object) {
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