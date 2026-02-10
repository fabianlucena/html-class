import Element from './element.js';
import { isEqual } from '../utils/type.js';
import { getStatusText } from '../utils/http.js';
import { newId } from '../utils/id.js';

export default class Item extends Element {
  shapes = [];

  box = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };

  #selected = false;

  get selected() {
    return this.#selected;
  }

  set selected(value) {
    if (this.#selected === value)
      return;

    this.#selected = value;
    this.svgElement?.classList.toggle('actdia-selected', value);
  }

  get skipExport() {
    const skip =[
      'skipExport',
      'shape',
      'svgElement',
      'svgShape',
      'svgSelectionBox',
      'actdia',
    ];

    if (this.constructor.skipExport) {
      skip.push(...this.constructor.skipExport);
    }

    return skip;
  }

  getCoords() {
    return [this.x, this.y];
  }

  setCoords(value) {
    if (typeof value === 'string') {
      value = value.replace(/\[|\]|\s/g, '').split(',').map(s => parseFloat(s));
    }
    
    if (Array.isArray(value) && value.length === 2) {
      const [x, y] = value;
      if (!isNaN(x)) this.x = x;
      if (!isNaN(y)) this.y = y;
      this.updateTransform();
      return;
    }

    if (value instanceof Object) {
      if (!isNaN(value.x)) this.x = value.x;
      if (!isNaN(value.y)) this.y = value.y;
      this.updateTransform();
      return;
    }
  }

  get reflection() {
    if (this.sx < 0) {
      if (this.sy < 0) {
        return [-1, -1];
      }
      return [-1, 1];
    }

    if (this.sy < 0) {
      return [1, -1];
    }

    return;
  }

  set reflection(scale) {
    if (typeof scale === 'string') {
      scale = scale.replace(/\[|\]|\s/g, '').split(',').map(s => parseFloat(s));
    }
    const [sx, sy] = scale;

    if (sx < 0) {
      if (isNaN(this.sx))
        this.sx = -1;
      else if (this.sx > 0)
        this.sx = -this.sx;
    } else if (sx > 0) {
      if (isNaN(this.sx))
        this.sx = 1;
      else if (this.sx < 0)
        this.sx = -this.sx;
    }

    if (sy < 0) {
      if (isNaN(this.sy))
        this.sy = -1;
      else if (this.sy > 0)
        this.sy = -this.sy;
    } else if (sy > 0) {
      if (isNaN(this.sy))
        this.sy = 1;
      else if (this.sy < 0)
        this.sy = -this.sy;
    }

    this.updateTransform();
  }

  #rotation = 0;
  get rotation() {
    return this.#rotation || 0;
  }

  set rotation(value) {
    this.#rotation = value;
    this.updateTransform();
  }

  init(options) {
    super.init(...arguments);
    this.id ??= newId();
  }

  clone() {
    return new this.constructor(this);
  }

  getDataPropertyNames(options) {
    let props = [];
    let current = this;

    while (current && current !== Object.prototype) {
      const newProps = Object.getOwnPropertyDescriptors(current);
      for (const propName in newProps) {
        if (!this.skipExport.includes(propName)
          && !options.skip?.includes(propName)
        ) {
          const prop = newProps[propName];
          if (prop.enumerable
            && !props.includes(propName)
          ) {
            props.push(propName);
          } else if (
            typeof prop.value !== 'function'
            && !props.includes(propName)
            && prop.get
            && prop.set
          ) {
            props.push(propName);
          }
        }
      }

      current = Object.getPrototypeOf(current);
    }

    return props;
  }

  getData(options = {}) {
    const elementClass = this.constructor.name;
    const data = {
      elementClass,
      url: this.getElementClassUrl(),
      id: this.id,
    };

    const defaultItem = this.getDefaultObject();
    const keys = this.getDataPropertyNames(options);
    for (const key of keys) {
      const value = this[key];
      const defaultValue = defaultItem[key];

      if (!isEqual(value, defaultValue)) {
        data[key] = value;
      }
    }

    return data;
  }

  removeReferencedItems(...items) {
    items.forEach(item => this.removeReferencedItem(item));
  }

  removeReferencedItem(item) {}

  removeReferences() {}

  #status = 0;
  get status() {
    return this.#status;
  }
  
  set status(value) {
    this.setStatus(value);
  }

  setStatus(value, options = {}) {
    if (JSON.stringify(this.status) === JSON.stringify(value))
      return;

    this.#status = value;
    this.statusUpdated(options);
  }

  setBackStatus(backStatus, options = {}) {
    if (JSON.stringify(this.backStatus) === JSON.stringify(backStatus))
      return;

    this.backStatus = backStatus;
    this.backStatusUpdated(options);
  }

  getStatusText() {
    return getStatusText(this.status);
  }

  updateStatus() {}

  statusUpdated() {}

  backStatusUpdated() {}

  moveTo(to) {
    this.x = to.x;
    this.y = to.y;
    this.updateTransform();
  }

  updateTransform() {
    let transform = `translate(${this.x}, ${this.y})`;

    let rotation = this.rotation;
    if (rotation) {
      if (Array.isArray(rotation))
        rotation = rotation.join(' ');
      else
        rotation = `${rotation} ${this.rotationCenterX || 0} ${this.rotationCenterY || 0}`;

      transform += ` rotate(${this.rotation})`;
    }

    if ((!isNaN(this.sx) && this.sx) || (!isNaN(this.sy) && this.sy)) {
      transform += ` scale(${(this.sx) ?? 1}, ${(this.sy) ?? 1})`;
    }
    
    if (this.skewX) {
      transform += ` skewX(${this.skewX})`;
    }
    
    if (this.skewY) {
      transform += ` skewY(${this.skewY})`;
    }
    
    this.svgElement?.setAttribute('transform', transform.trim());
    this.connectors?.forEach(connector => {
      connector.connections?.forEach(connection => connection.update());
    });
  }

  update(options = {}) {
    if (!options.skipNotification) {
      this.updateTransform();
      this.actdia?.updateItem(this);
    }
  }

  updateBackStatus(options = {}) {
    if (!options.skipNotification) {
      this.updateTransform();
      this.actdia?.updateItem(this);
    }
  }

  select(selectValue = true) {
    this.selected = selectValue;
  }
}
