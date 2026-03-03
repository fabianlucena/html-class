import { _ } from '../locale/locale.js';

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
  if (a[0].length !== b.length) {
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

export function isSquareMatrix(m) {
  const dim = isMatrix(m);
  return dim && dim[0] === dim[1];
}

export function determinant(m) {
  if (!isSquareMatrix(m)) {
    throw new Error(_('Not a square matrix'));
  }

  if (m.length === 1) {
    return m[0][0];
  }

  if (m.length === 2) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }

  if (m.length === 3) {
    return m[0][0] * m[1][1] * m[2][2]
         + m[0][1] * m[1][2] * m[2][0]
         + m[0][2] * m[1][0] * m[2][1]
         - m[0][2] * m[1][1] * m[2][0]
         - m[0][0] * m[1][2] * m[2][1]
         - m[0][1] * m[1][0] * m[2][2];
  }

  const {p, u, sign} = _pluDecomposition(m);
  let det = 1;
  for (let i = 0; i < p.length; i++) {
    det *= u[i][i];
  }
  return det * sign;
}

export function pluDecomposition(m) {
  if (!isSquareMatrix(m)) {
    throw new Error(_('Not a square matrix'));
  }

  return _pluDecomposition(m);
}

function _pluDecomposition(m) {
  const n = m.length;
  const p = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const l = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  const u = m.map(row => row.slice());
  let swaps = 0; // contador de intercambios

  for (let k = 0; k < n; k++) {
    // 1. Buscar pivote
    let pivot = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(u[i][k]) > Math.abs(u[pivot][k])) {
        pivot = i;
      }
    }

    // 2. Intercambiar filas en U, P y L
    if (pivot !== k) {
      [u[k], u[pivot]] = [u[pivot], u[k]];
      [p[k], p[pivot]] = [p[pivot], p[k]];
      swaps++;
      for (let j = 0; j < k; j++) {
        [l[k][j], l[pivot][j]] = [l[pivot][j], l[k][j]];
      }
    }

    // 3. Eliminar debajo del pivote
    for (let i = k + 1; i < n; i++) {
      l[i][k] = u[i][k] / u[k][k];
      for (let j = k; j < n; j++) {
        u[i][j] -= l[i][k] * u[k][j];
      }
    }
  }

  // Completar diagonal de L
  for (let i = 0; i < n; i++)
    l[i][i] = 1;

  // signo de la permutación
  const sign = (swaps % 2 === 0) ? 1 : -1;

  return { p, l, u, swaps, sign };
}

export function transposeMatrix(m) {
  if (!isMatrix(m)) {
    throw new Error(_('Not a matrix'));
  }

  return _transposeMatrix(m);
}

function _transposeMatrix(m) {
  return m[0].map((_, j) => m.map(row => row[j]));
}

export function invertMatrix(m) {
  if (!isSquareMatrix(m)) {
    throw new Error(_('Not a square matrix'));
  }

  return _invertMatrix(m);
}

function _invertMatrix(m) {
  const n = m.length;
  const { p, l, u } = pluDecomposition(m);

  // Aplicar P a la identidad
  const I = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const B = p.map((row, i) => {
    const idx = row.indexOf(1);
    return I[idx].slice();
  });

  // Resolver L y luego U para cada columna
  const x = Array.from({ length: n }, () => Array(n).fill(0));

  for (let col = 0; col < n; col++) {
    // forward substitution: L y = B[:,col]
    const y = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = B[i][col];
      for (let j = 0; j < i; j++) sum -= l[i][j] * y[j];
      y[i] = sum;
    }

    // backward substitution: U x = y
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = y[i];
      for (let j = i + 1; j < n; j++) sum -= u[i][j] * x[j];
      x[i] = sum / u[i][i];
    }

    for (let i = 0; i < n; i++) x[i][col] = x[i];
  }

  return x;
}