export function getNumber(tryNumber, defaultValue = 0) {
  if (tryNumber === null || typeof tryNumber === 'undefined')
    return defaultValue;

  tryNumber = Number(tryNumber);
  if (isNaN(tryNumber) || tryNumber === null || typeof tryNumber === 'undefined')
    return defaultValue;

  return tryNumber;
}

export function isNumber(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

export function formatFloat(value, precision = 3) {
    if (typeof value === 'string')
      value = parseFloat(value);

    if (isNaN(value))
      return 'NAN';

    if (!isFinite(value))
      return 'INF';

    if (!value)
      return '0';

    if (value < 0.01 && value > -0.01 || value > 9999 || value < -9999)
      return value.toExponential(precision);

    return value.toFixed(precision + 2).replace(/\.?0+$/, '');
  }