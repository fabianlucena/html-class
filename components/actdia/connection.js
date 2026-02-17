import Item from './item.js';

export default class Connection extends Item {
  draggable = false;

  shape = {
    shape: 'path',
    d: 'M0 0 L1 1',
    fill: 'none',
  };

  noSelectionBox = true;
  noNameText = true;

  init(data) {
    const allData = {};
    Object.assign(allData, ...arguments);
    const { from, to, items, ...rest } = allData;

    from && this.setFrom(from, items);
    to && this.setTo(to, items);

    super.init(rest);

    this.update();
  }

  setFrom(from, items) {
    if (!from?.item)
      throw new Error('Connection "from" item is required');

    if (typeof from.item === 'string') {
      from.item = items.find(i => i.id === from.item);
      if (!from.item)
        throw new Error('Connection "from" item not found');
    }

    if (typeof from.connector === 'string') {
      from.connector = from.item.getConnectorFromId(from.connector);
      if (!from.connector)
        throw new Error('Connector "from" not found');
    }

    from.connector.addConnection(this);

    this.from = from;
  }

  setTo(to, items) {
    if (!to?.item && to !== 'mouse')
      throw new Error('Connection "to" item, or "mouse" is required');

    if (to !== 'mouse') {
      if (typeof to.item === 'string') {
        to.item = items.find(i => i.id === to.item);
        if (!to.item)
          throw new Error('Connection "to" item not found');
      }

      if (typeof to.connector === 'string') {
        to.connector = to.item.getConnectorFromId(to.connector);
        if (!to.connector)
          throw new Error('Connector "to" not found');
      }

      to.type ??= to.connector.type;
      to.index ??= to.connector.index;
      to.connector.addConnection(this);
    }

    this.to = to;
  }

  removeReferencedItem(item) {
    if (this.from && this.from.item === item) {
      this.from.connector.removeConnection(this);
      this.from = null;
    }

    if (this.to && this.to.item === item) {
      this.to.connector.removeConnection(this);
      this.to = null;
    }
  }

  removeReferences() {
    if (this.from && this.from.item) {
      this.from.connector.removeConnection(this);
      this.from = null;
    }

    if (this.to && this.to.item) {
      this.to.connector.removeConnection(this);
      this.to = null;
    }
  }

  getData() {
    const elementClass = this.constructor.name;
    const data = {
      elementClass,
      url: this.getElementClassUrl(),
      id: this.id,
      from: {
        connector: this.from.connector.id,
        item: this.from.item.id,
      },
      to: {
        connector: this.to.connector?.id,
        item: this.to.item?.id,
      },
    };

    if (this.ortho) {
      data.ortho = this.ortho;
    }

    return data;
  }

  update({ mouse } = {}) {
    this.x = 0;
    this.y = 0;

    if (!this.from || !this.to || this.to === 'mouse' && !mouse) {
      return;
    }

    if (!this.from.item.svgElement.getCTM) {
      return;
    }

    const 
      fromCtm = this.from.item.svgElement.getCTM?.(),
      fx = ( fromCtm.e + this.from.connector.x * fromCtm.a + this.from.connector.y * fromCtm.c ) / this.actdia.style.sx,
      fy = ( fromCtm.f + this.from.connector.x * fromCtm.b + this.from.connector.y * fromCtm.d ) / this.actdia.style.sx;
    if (isNaN(fx) || isNaN(fy)) {
      this.shape = {};
      return; 
    }

    const isMouse = this.to === 'mouse';
    let tx, ty, toCtm;
    if (isMouse) {
      tx = mouse.x;
      ty = mouse.y;
    } else {
      toCtm = this.to.item.svgElement.getCTM();
      tx = ( toCtm.e + (this.to.connector.x ?? 0) * toCtm.a + (this.to.connector.y ?? 0) * toCtm.c ) / this.actdia.style.sx;
      ty = ( toCtm.f + (this.to.connector.x ?? 0) * toCtm.b + (this.to.connector.y ?? 0) * toCtm.d ) / this.actdia.style.sy;
    }
    if (isNaN(tx) || isNaN(ty)) {
      this.shape = {};
      return; 
    }

    const
      dx = tx - fx,
      dy = ty - fy;

    let d = `M ${fx} ${fy} `;
    if (this.ortho) {
      const 
        fromDir = this.from.connector.direction % 360,
        fromHorizontal = fromDir >= 45 && fromDir < 135 || fromDir >= 225 && fromDir < 315;
      if (mouse) {
        if (fromHorizontal) {
          d += `L ${fx} ${ty} L ${tx} ${ty}`;
        } else {
          d += `L ${tx} ${fy} L ${tx} ${ty}`;
        }
      } else {
        const 
          toDir = this.to.connector.direction % 360,
          toHorizontal = toDir >= 45 && toDir < 135 || toDir >= 225 && toDir < 315;
        if (fromHorizontal === toHorizontal) {
          if (fromHorizontal) {
             const midY = fy + dy / 2;
             d += `L ${fx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`;
          } else {
            const midX = fx + dx / 2;
            d += `L ${midX} ${fy} L ${midX} ${ty} L ${tx} ${ty}`;
          }
        } else {
          if (fromHorizontal) {
            d += `L ${fx} ${ty} L ${tx} ${ty}`;
          } else {
            d += `L ${tx} ${fy} L ${tx} ${ty}`;
          }
        }
      }
    } else {
      const
        dd = Math.pow(dx * dx + dy * dy, 1 / 2) / 3,
        fa = this.from.connector.direction / 180 * Math.PI - Math.atan2(fromCtm.b, fromCtm.a),
        x1 = fx + dd * Math.cos(fa),
        y1 = fy - dd * Math.sin(fa);

      if (isMouse) {
        d += `Q ${x1} ${y1} ${tx} ${ty}`;
      } else {
        const
          ta = (this.to.connector.direction / 180 * Math.PI - Math.atan2(toCtm.b, toCtm.a)),
          x2 = tx + dd * Math.cos(ta),
          y2 = ty - dd * Math.sin(ta);
        d += `C ${x1} ${y1} ${x2} ${y2} ${tx} ${ty}`;
      }
    }

    this.shape = {
      shape: 'path',
      d,
    };

    this.actdia.tryUpdateShape(this, this.svgElement?.children[0], this.shape);
  }

  statusUpdated(options) {
    let to;
    if (options.from === this.from?.connector)
      to = this.to;
    else if (options.from === this.to?.connector)
      to = this.from;

    if (to
      && to !== 'mouse'
      && to.connector.type === 'in'
      && !options.connectors.has(to.connector)
    ) {
      options = { ...options, connectors: new Set([...options.connectors]) };
      to.connector.setStatus(this.status, options);
    }
  }

  setBackStatus(backStatus, options) {
    let to;
    if (options.from === this.from?.connector)
      to = this.to;
    else if (options.from === this.to?.connector)
      to = this.from;

    if (to
      && to !== 'mouse'
      && to.connector.type === 'out'
      && !options.connectors.has(to.connector)
    ) {
      options = { ...options, connectors: new Set([...options.connectors]) };
      to.connector.setBackStatus(backStatus, options);
    }
  }
}
