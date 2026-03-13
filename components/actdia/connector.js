import Element from './element.js';
import { _ } from '../locale/locale.js';
import { doesExtend } from '../utils/type.js';
import { getStatusText } from '../utils/http.js';
import { newId } from '../utils/id.js';
import { deepCopy } from '../utils/object.js';

export const DIRECTIONS = {
  RIGHT: 0,
  DOWN: 270,
  LEFT: 180,
  UP: 90,
};

export default class Connector extends Element {
  static connectorsClassesInfo = {};

  static create(options) {
    let type;
    for (let i = arguments.length - 1; i >= 0; i--) {
      const argument = arguments[i];
      if (argument?.type) {
        type = argument.type;
        break;
      }
    }

    let classInfo = Connector.connectorsClassesInfo[type];
    if (!classInfo) {
      const registeredClasses = Element.getRegisteredClassesInfo();
      for (const thisClassInfo of registeredClasses) {
        if (doesExtend(thisClassInfo.classRef, Connector)) {
          const classType = new thisClassInfo.classRef().type;
          if (classType === type) {
            classInfo = thisClassInfo;
            Connector.connectorsClassesInfo[type] = thisClassInfo;
            break;
          }
        }
      }

      if (!classInfo) {
        throw new Error(_('No Connector class registered for type: %s.', type));
      }
    }

    return Element.create(classInfo, ...arguments);
  }

  connections = [];
  status = {};

  init(options) {
    super.init(...arguments);
    this.id ??= newId();
    this.direction = this.getDirection(this.direction, 'left');
    if (typeof this.name === 'function') {
      this.name = this.name(this);
    }
  }

  getDirection(direction, defaultDirection) {
    if (typeof direction === 'number') {
      if (isNaN(direction) || !isFinite(direction))
          return this.getDirection(defaultDirection, 90);

      return direction;
    }

    if (typeof direction === 'function')
      return direction();

    if (typeof direction === 'string') {
      switch (direction) {
        case 'right': return 0;
        case 'bottom':
        case 'down': return 270;
        case 'left': return 180;
        case 'top':
        case 'up': return 90;
      }
    }

    return this.getDirection(defaultDirection, 90);
  }

  addConnection(item) {
    this.connections ||= [];
    this.connections.push(item);

    if (this.connections?.length) {
      if (this.isOutput) {
        this.propagate();
      } else if (this.isInput) {
        this.recv(this.connections[0].status);
      }
    }
  }

  removeConnection(item) {
    this.connections = (this.connections || []).filter(i => i !== item);
  }

  send(data, options = {}) {
    this.status.send = deepCopy(data);

    options = {...options};
    this.onSend?.({ connector: this, data, options });
    this.onUpdate?.({ connector: this, data, action: 'send', options });

    if (options.propagate !== false) {
      options.action = 'send';
      options.data ??= data;
      this.propagate(options);
    }
  }

  recv(data, options = {}) {
    this.status.recv = deepCopy(data);

    this.onRecv?.({ connector: this, data, options });
    this.onUpdate?.({ connector: this, data, action: 'recv', options });

    if (options.propagate !== false) {
      this.item.updateStatus(options);
    }

    if (options.backPropagate) {
      options.action = 'recv';
      options.data ??= this.status.recv;
      this.backPropagate(options);
    }
  }

  getStatusText() {
    return getStatusText(this.status);
  }

  propagate(options = {}) {
    options ??= {};
    const connectors = new Set([...options.connectors || []]);
    if (connectors?.has(this)) {
      this.actdia?.pushNotification(_('Circular propagation detected, stopping.'), 'warning');
      return;
    }

    this.connections
      .forEach(connection => {
        options.from = this;
        options.connectors = new Set([...connectors, this]);
        connection.setStatus(options.data, options);
      });
  }
}
