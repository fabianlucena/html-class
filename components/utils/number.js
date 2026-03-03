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

const locale = navigator.language || navigator.userLanguage || 'en';
const decimalSeparator = (1.1).toLocaleString(locale).substring(1, 2);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const lastCerosRegExp = new RegExp(`${escapeRegex(decimalSeparator)}?0+$`);

export function formatFloat(value, precision = 3) {
  if (typeof value === 'string')
    value = parseFloat(value);

  if (isNaN(value))
    return 'NAN';

  if (!isFinite(value))
    return 'INF';

  if (!value)
    return '0';

  if (value < 0.01 && value > -0.01 || value > 9999 || value < -9999) {
    const exp = value.toExponential(precision);
    const [mantissa, exponent] = exp.split('e');

    const mantissaLocalized = new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(Number(mantissa));

    return `${mantissaLocalized}e${exponent}`;
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision + 2,
    maximumFractionDigits: precision + 2
  }).format(value)
    .replace(lastCerosRegExp, '');
}