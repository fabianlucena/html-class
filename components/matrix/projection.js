export function orthographic(fov, aspect, near, far) {
  const left = -aspect * fov / 2;
  const right = aspect * fov / 2;
  const top = fov / 2;
  const bottom = -fov / 2;
  const matrix = [];
  matrix[0] = [ 2 / (right - left), 0, 0, - (right + left) / (right - left) ];
  matrix[1] = [ 0, 2 / (top - bottom), 0, - (top + bottom) / (top - bottom) ];
  matrix[2] = [ 0, 0, -2 / (far - near), - (far + near) / (far - near) ];
  matrix[3] = [ 0, 0, 0, 1 ];
  return matrix;
}

export function perspective(fov, aspect, near, far) {   
  const matrix = [];      
  matrix[0] = [ 1 / (aspect * Math.tan(fov * Math.PI / 360)), 0, 0, 0 ];
  matrix[1] = [ 0, 1 / Math.tan(fov * Math.PI / 360), 0, 0 ];
  matrix[2] = [ 0, 0, - (far + near) / (far - near), - (2 * far * near) / (far - near) ];
  matrix[3] = [ 0, 0, -1, 0 ];
  return matrix;
}