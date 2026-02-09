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