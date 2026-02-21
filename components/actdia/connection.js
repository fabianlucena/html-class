import Item from './item.js';

export default class Connection extends Item {
  draggable = false;

  shape = {
    shapes: [
      {
        shape: 'path',
        d: 'M0 0 L1 1',
        fill: 'none',
      },
    ],
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

    if (this.style) {
      data.style = {...this.style};
    }

    if (this.path) {
      data.path = this.path;
    }

    if (this.gap) {
      data.gap = this.gap;
    }

    if (this.gapStart) {
      data.gapStart = this.gapStart;
    }

    if (this.gapEnd) {
      data.gapEnd = this.gapEnd;
    }

    if (this.markerStart) {
      data.markerStart = this.markerStart;
    }

    if (this.markerEnd) {
      data.markerEnd = this.markerEnd;
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
      this.shape.shapes[0] = {};
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
      this.shape.shapes[0] = {};
      return; 
    }

    const
      fa = this.from.connector.direction / 180 * Math.PI - Math.atan2(fromCtm.b, fromCtm.a),
      ta = this.to.connector && toCtm ? (this.to.connector.direction / 180 * Math.PI - Math.atan2(toCtm.b, toCtm.a)) : 0,
      dx = tx - fx,
      dy = ty - fy;

    const path = this.path || this.actdia.style.connection.path || 'smooth';
    const gapStart = this.gapStart ?? this.gap 
      ?? this.actdia.style.connection.gapStart ?? this.actdia.style.connection.gap ?? 0;

    let d = `M ${fx} ${fy} `,
      endD = '',
      fxd = fx,
      fyd = fy,
      txd = tx,
      tyd = ty;
    if (gapStart) {
      fxd += gapStart * Math.cos(fa),
      fyd -= gapStart * Math.sin(fa);
      d += ` L ${fxd} ${fyd}`;
    }
    if (!isMouse) {
      const gapEnd = this.gapEnd ?? this.gap 
        ?? this.actdia.style.connection.gapEnd ?? this.actdia.style.connection.gap ?? 0;
      if (gapEnd) {
        endD = ` L ${txd} ${tyd}` + endD;
        txd += gapEnd * Math.cos(ta);
        tyd -= gapEnd * Math.sin(ta);
      }
    }

    if (path === 'orthogonal') {
      const 
        fromDir = this.from.connector.direction % 360,
        fromHorizontal = fromDir >= 45 && fromDir < 135 || fromDir >= 225 && fromDir < 315;
      if (mouse) {
        if (fromHorizontal) {
          d += `L ${fxd} ${tyd} L ${txd} ${tyd}`;
        } else {
          d += `L ${txd} ${fyd} L ${txd} ${tyd}`;
        }
      } else {
        const 
          toDir = this.to.connector.direction % 360,
          toHorizontal = toDir >= 45 && toDir < 135 || toDir >= 225 && toDir < 315;
        if (fromHorizontal === toHorizontal) {
          if (fromHorizontal) {
             const midY = fyd + dy / 2;
             d += `L ${fxd} ${midY} L ${txd} ${midY} L ${txd} ${tyd}`;
          } else {
            const midX = fxd + dx / 2;
            d += `L ${midX} ${fyd} L ${midX} ${tyd} L ${txd} ${tyd}`;
          }
        } else {
          if (fromHorizontal) {
            d += `L ${fxd} ${tyd} L ${txd} ${tyd}`;
          } else {
            d += `L ${txd} ${fyd} L ${txd} ${tyd}`;
          }
        }
      }
    } else if (path === 'straight') {
      d += `L ${txd} ${tyd}`;
    } else {
      const
        dd = Math.pow(dx * dx + dy * dy, 1 / 2) / 3,
        x1 = fxd + dd * Math.cos(fa),
        y1 = fyd - dd * Math.sin(fa);

      if (isMouse) {
        d += `Q ${x1} ${y1} ${txd} ${tyd}`;
      } else {
        const
          x2 = txd + dd * Math.cos(ta),
          y2 = tyd - dd * Math.sin(ta);
        d += `C ${x1} ${y1} ${x2} ${y2} ${txd} ${tyd}`;
      }
    }

    d += endD;
    const shapes = [{
      shape: 'path',
      d,
    }];

    shapes.push(this.getMarkerShape(this.markerStart ?? this.actdia.style.connection.markerStart, fx, fy, fa));
    shapes.push(this.getMarkerShape(this.markerEnd ?? this.actdia.style.connection.markerEnd, tx, ty, ta));

    this.shape.item = this;
    this.shape.svgElement = this.svgElement?.children[0];
    this.shape.shapes = shapes
      .filter(s => s)
      .map(s => ({
        item: this,
        ...s,
      }));

    this.actdia.tryUpdateShape(this.shape);
  }

  getMarkerShape(marker, x, y, a) {
    const mz = this.markerSize || this.actdia.style.connection.markerSize || .8;
    const ma = this.markerAspectRatio || this.actdia.style.connection.markerAspectRatio;

    if (marker === 'arrow') {
      const mw = mz * (ma ?? .7);
      return {
        className: 'marker',
        shape: 'path',
        d: `M 0 0 l ${mz} ${mw / 2} l 0 -${mw} Z`,
        x,
        y,
        rotate: [(-a * 180 / Math.PI), 0, 0],
      };
    }
    
    if (marker === 'circle') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker',
        shape: 'ellipse',
        cx: x + mz / 2,
        cy: y,
        rx: mz / 2,
        ry: mw / 2,
        rotate: [(-a * 180 / Math.PI), x, y],
      };
    }
    
    if (marker === 'square') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker',
        shape: 'rect',
        x,
        y: y - mw / 2,
        width: mz,
        height: mw,
        rotate: [(-a * 180 / Math.PI), x, y],
      };
    }

    if (marker === 'diamond') {
      const 
        mw = mz * (ma ?? 1),
        mz_2 = mz / 2,
        mw_2 = mw / 2;
      return {
        className: 'marker',
        shape: 'path',
        d: `M ${x + mz_2} ${y - mw_2} l ${mz_2} ${mw_2} l -${mz_2} ${mw_2} l -${mz_2} -${mw_2} Z`,
        rotate: [(-a * 180 / Math.PI), x, y],
      };
    }

    if (marker === 'triangle') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker',
        shape: 'path',
        d: `M 0 0 l ${mz} ${mw / 2} l 0 -${mw} Z`,
        x,
        y,
        rotate: [(-a * 180 / Math.PI), 0, 0],
      };
    }

    if (marker === 'circledDot') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker',
        shape: 'g',
        shapes: [
          {
            shape: 'ellipse',
            cx: x + mz / 2,
            cy: y,
            rx: mz / 2,
            ry: mw / 2,
            rotate: [(-a * 180 / Math.PI), x, y],
            className: 'outlined',
          },
          {
            shape: 'ellipse',
            cx: x + mz / 2,
            cy: y,
            rx: mz / 3.8,
            ry: mw / 3.8,
            rotate: [(-a * 180 / Math.PI), x, y],
          },
        ],
      };
    }

    if (marker === 'slash') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker outlined',
        shape: 'line',
        x1: x,
        y1: y - mw / 2,
        x2: x + mz,
        y2: y + mw / 2,
        rotate: [(-a * 180 / Math.PI), x, y],
      };
    }

    if (marker === 'x') {
      const mw = mz * (ma ?? 1);
      return {
        className: 'marker outlined',
        shape: 'path',
        d: `M ${x} ${y - mw / 2} L ${x + mz} ${y + mw / 2} M ${x} ${y + mw / 2} L ${x + mz} ${y - mw / 2}`,
        rotate: [(-a * 180 / Math.PI), x, y],
      };
    }

    return null;
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
