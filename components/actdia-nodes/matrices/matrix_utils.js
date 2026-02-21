export function isMatrix(m) {
  if (!Array.isArray(m)) {
    return false;
  }

  if (m.length === 0) {
    return false;
  }

  let cols = m[0].length;
  if (!m.every(row => Array.isArray(row) && row.length === cols)) {
    return false;
  }

  return [m.length, cols];
}

export function isVector(v) {
  return Array.isArray(v);
}

export function isScalar(s) {
  return typeof s === 'number';
}

export function add(a, b) {
  if (isMatrix(a)) {
    if (isMatrix(b)) {
      return _addMatrices(a, b);
    } else {
      throw new Error(_('Second operand is not a matrix'));
    }
  } else if (isVector(a)) {
    if (isVector(b)) {
      return _addVectors(a, b);
    } else {
      throw new Error(_('Second operand is not a vector'));
    }
  } else if (isScalar(a)) {
    if (isScalar(b)) {
      return a + b;
    } else {
      throw new Error(_('Second operand is not a scalar'));
    }
  } else {
    throw new Error(_('First operand is not a matrix, vector, or scalar'));
  }
}

function _addMatrices(a, b) {
  const aRows = a.length, aCols = a[0].length;
  const bRows = b.length, bCols = b[0].length;

  if (aRows !== bRows || aCols !== bCols) {
    throw new Error(_('Incompatible dimensions'));
  }

  return a.map((row, i) =>
    row.map((v, j) => v + b[i][j])
  );
}

function _addVectors(a, b) {
  if (a.length !== b.length) {
    throw new Error(_('Incompatible dimensions'));
  }

  return a.map((v, i) => v + b[i]);
}

export function multiply(a, b) {
  if (isMatrix(a)) {
    if (isMatrix(b)) {
      return _multiplyMatrices(a, b);
    } else if (isVector(b)) {
      return _multiplyMatrixVector(a, b);
    } else if (isScalar(b)) {
      return _multiplyMatrixScalar(a, b);
    } else {
      throw new Error(_('Second operand is not a matrix, vector, or scalar'));
    }
  } else if (isVector(a)) {
    if (isMatrix(b)) {
      return _multiplyVectorMatrix(a, b);
    } else if (isVector(b)) {
      return _multiplyVectors(a, b);
    } else if (isScalar(b)) {
      return _multiplyVectorScalar(a, b);
    } else {
      throw new Error(_('Second operand is not a matrix, vector, or scalar'));
    }
  } else if (isScalar(a)) {
    if (isMatrix(b)) {
      return _multiplyMatrixScalar(b, a);
    } else if (isVector(b)) {
      return _multiplyVectorScalar(b, a);
    } else if (isScalar(b)) {
      return a * b;
    } else {
      throw new Error(_('Second operand is not a matrix, vector, or scalar'));
    }
  } else {
    throw new Error(_('First operand is not a matrix, vector, or scalar'));
  }
}

export function multiplyMatrices(a, b) {
  if (!isMatrix(a)) {
    throw new Error(_('First operand is not a matrix'));
  }

  if (!isMatrix(b)) {
    throw new Error(_('Second operand is not a matrix'));
  }

  return _multiplyMatrices(a, b);
}

function _multiplyMatrices(a, b) {
  const
    aRows = a.length, 
    bRows = b.length;

  if (aRows !== b[0].length
    || bRows !== a[0].length
  ) {
    throw new Error(_('Incompatible dimensions'));
  }

  return a.map((rowA, i) =>
    b[0].map((_, j) =>
      rowA.reduce((sum, v, k) => sum + v * b[k][j], 0)
    )
  );
}

function _multiplyMatrixVector(m, v) {
  if (m[0].length !== v.length) {
    throw new Error(_('Incompatible dimensions'));
  }

  return m.map(r => r.reduce((s, x, j) => s + x * v[j], 0));
}

function _multiplyVectorMatrix(v, m) {
  if (v.length !== m.length) {
    throw new Error(_('Incompatible dimensions'));
  }

  return m[0].map((_, j) => v.reduce((s, x, i) => s + x * m[i][j], 0));
}

function _multiplyMatrixScalar(m, s) {
  return m.map(row => row.map(v => v * s));
}

function _multiplyVectorScalar(v, s) {
  return v.map(x => x * s);
}

function _multiplyVectors(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error(_('Incompatible dimensions'));
  }

  return v1.reduce((s, x, i) => s + x * v2[i], 0);
}