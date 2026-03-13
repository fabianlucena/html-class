import Connector from './connector.js';
import { deepCopy } from '../utils/object.js';

export default class ConnectorIO extends Connector {
  type = 'io';
  accepts = [ 'io', 'in', 'out' ];
  multiple = true;
  isInput = true;
  isOutput = true;

  setStatus(status, options = {}) {
    if (!status.send) {
      if (typeof status !== 'object') {
        status = { send: status };
      } else {
        status = { recv: Object.values(status || {})[0] };
        options.propagate = false;
      }
    }

    super.setStatus(status, options);
  }

  propagate(options = {}) {
    options ??= {};
    const connectors = new Set([...options.connectors || []]);
    if (connectors?.has(this)) {
      this.actdia?.pushNotification(_('Circular propagation detected, stopping.'), 'warning');
      return;
    }

    const name = this.item.name + ' - ' + this.name;
    const status = {
      [name]: this.status.send,
    };

    this.connections.forEach(connection => {
      options.from = this;
      options.connectors = new Set([...connectors, this]);
      connection.setStatus(status, options);
    });
  }
}
