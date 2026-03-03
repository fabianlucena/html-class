import { _ } from '../locale/locale.js';
import { isNumber, formatFloat } from './number.js';

export function getStatusText(status) {
  if (status === null)
    return _('null');

  if (status === undefined)
    return _('undefined');

  if (status === true)
    return _('true');

  if (status === false)
    return _('false');

  if (typeof status === 'object')
    return JSON.stringify(status);

  if (isNumber(status))
    return formatFloat(status);
  
  return String(status);
}
