import Connector from './connector.js';
import { deepCopy } from '../utils/object.js';

export default class ConnectorIn extends Connector {
  type = 'in';
  accepts = [ 'out' ];
  multiple = false;
  isInput = true;

  setStatus(status, options = {}) {
    status = deepCopy(status)
    this.status = status;

    if (this.onUpdate) {
      this.onUpdate({ status });
    }

    this.item?.updateStatus({ ...options, connector: this });

    this.propagate(options);
  }
}
