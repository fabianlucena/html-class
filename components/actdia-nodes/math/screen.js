export default function create({ Node }) {
  return class Screen extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 20,
          height: 20,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'rect',
          x: 0.5,
          y: 0.5,
          width: 19,
          height: 19,
          rx: .2,
          ry: .2,
          fill: 'black',
        },
        {
          name: 'xGrid',
          shape: 'path',
          stroke: '#80FF8060',
          fill: false,
          display: false,
        },
        {
          name: 'yGrid',
          shape: 'path',
          stroke: '#8080FF60',
          fill: false,
          display: false,
        },
        {
          name: 'xAxis',
          shape: 'line',
          x1: 0.5,
          y1: 0.5,
          x2: 19.5,
          y2: 0.5,
          stroke: '#80FF80A0',
          fill: false,
          display: false,
        },
        {
          name: 'yAxis',
          shape: 'line',
          x1: 0.5,
          y1: 0.5,
          x2: 0.5,
          y2: 19.5,
          stroke: '#8080FFA0',
          fill: false,
          display: false,
        },
        {
          name: 'path',
          shape: 'path',
          x: 0.5,
          y: 0.5,
          d: 'M 0 0',
          stroke: '#ffd152',
          fill: false,
        },
        {
          name: 'dots',
          x: 0.5,
          y: 0.5,
          children: [],
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    connectors = [
      { name: 'input', type: 'in', x: 0, y: 2, direction: 'left', extends: 'small' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

    #input = null;
    #borderWidth = .5;
    #drawOffset = { x: 0, y: 0 };
    #drawScale = { x: 1, y: 1 };
    #axis = { x: false, y: false };
    #grid = { x: false, y: false };
    #autoOffset = false;
    #connectThePoints = true;
    #closePath = true;
    #color = '#ffd152';
    #xAxisShape = null;
    #yAxisShape = null
    #xGridShape = null;
    #yGridShape = null;

    get input() {
      return this.#input;
    }

    get drawOffset() {
      return this.#drawOffset;
    }

    set drawOffset(value) {
      this.setOffset(value);
    }

    get drawScale() {
      return this.#drawScale;
    }

    set drawScale(value) {
      this.setDrawScale(value);
    }

    get axis() {
      return this.#axis;
    }

    set axis(value) {
      this.setAxis(value);
    }

    get autoOffset() {
      return this.#autoOffset;
    }

    set autoOffset(value) {
      this.setAutoOffset(value);
    }

    get connectThePoints() {
      return this.#connectThePoints;
    }

    set connectThePoints(value) {
      this.setConnectThePoints(value);
    }

    get closePath() {
      return this.#closePath;
    }

    set closePath(value) {
      this.setClosePath(value);
    }

    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#xAxisShape = this.getShape('xAxis');
      this.#yAxisShape = this.getShape('yAxis');
      this.#xGridShape = this.getShape('xGrid');
      this.#yGridShape = this.getShape('yGrid');
    }

    setWidth(value) {
      this.shape.children[0].width = value;
      this.shape.children[1].width = value - 1;
      super.setWidth(...arguments);
    }

    setHeight(value) {
      this.shape.children[0].height = value;
      this.shape.children[1].height = value - 1;
      super.setHeight(...arguments);
    }

    setDrawOffset(value, update = true) {
      this.#drawOffset.x = value.x ?? value[0] ?? 0;
      this.#drawOffset.y = value.y ?? value[1] ?? 0;
      if (update)
        this.updateStatus();
    }
    
    setDrawScale(value, update = true) {
      this.#drawScale.x = value.x ?? value[0] ?? 1;
      this.#drawScale.y = value.y ?? value[1] ?? 1;
      if (update)
        this.updateStatus();
    }

    setAxis(value, update = true) {
      this.#xAxisShape ??= this.getShape('xAxis');
      this.#yAxisShape ??= this.getShape('yAxis');  
      if (!this.#xAxisShape || !this.#yAxisShape) {
        return;
      }

      this.#axis.x = value.x ?? value[0] ?? !!value;
      this.#axis.y = value.y ?? value[1] ?? !!value;

      this.#xAxisShape.display = value.x;
      this.#yAxisShape.display = value.y;
      if (update) {
        if (this.#axis.x || this.#axis.y)
          this.updateStatus();

        if (!this.#axis.x)
          this.updateShape(this.#xAxisShape);

        if (!this.#axis.y)
          this.updateShape(this.#yAxisShape);
      }
    }

    setGrid(value, update = true) {
      this.#xGridShape ??= this.getShape('xGrid');
      this.#yGridShape ??= this.getShape('yGrid');
      if (!this.#xGridShape || !this.#yGridShape) {
        return;
      }

      this.#grid.x = value.x ?? value[0] ?? !!value;
      this.#grid.y = value.y ?? value[1] ?? !!value;

      this.#xGridShape.display = value.x;
      this.#yGridShape.display = value.y;
      if (update) {
        if (this.#grid.x || this.#grid.y)
          this.updateStatus();

        if (!this.#grid.x)
          this.updateShape(this.#xGridShape);

        if (!this.#grid.y)
          this.updateShape(this.#yGridShape);
      }
    }

    setAutoOffset(value, update = true) {
      this.#autoOffset = value;
      if (value) {
        this.autoOffsetUpdate();
        if (update)
          this.updateStatus();
      }
    }

    autoOffsetUpdate() {
      if (this.autoOffset) {
        this.setDrawOffset({ x: 0, y: 0 }, false);
      }
    }

    setConnectThePoints(value, update = true) {
      this.#connectThePoints = value;
      if (update)
        this.updateStatus();
    }

    setClosePath(value, update = true) {
      this.#closePath = value;
      if (update)
        this.updateStatus();
    }

    #maxX = 0;
    #maxY = 0;
    clipSegment(p1, p2) {
      let [x1, y1] = p1;
      let [x2, y2] = p2;

      const dx = x2 - x1;
      const dy = y2 - y1;

      let t0 = 0;
      let t1 = 1;

      function clip(p, q) {
        if (p === 0) {
          return q >= 0;
        }
        
        const r = q / p;
        if (p < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
        return true;
      }

      if (
        clip(-dx, x1) &&
        clip(dx, this.#maxX - x1) &&
        clip(-dy, y1) &&
        clip(dy, this.#maxY - y1)
      ) {
        const start = [
          x1 + t0 * dx,
          y1 + t0 * dy
        ];
        const end = [
          x1 + t1 * dx,
          y1 + t1 * dy
        ];
        return [ start, end ];
      }

      return null;
    }

    clampToRect(point) {
      return [
        Math.max(0, Math.min(this.#maxX, point[0])),
        Math.max(0, Math.min(this.#maxY, point[1])),
      ];
    }

    getEdge(point) {
      const [x, y] = point;
      if (y === 0) return 'top';
      if (x === this.#maxX) return 'right';
      if (y === this.#maxY) return 'bottom';
      if (x === 0) return 'left';
      return null;
    }

    borderPosition([x, y]) {
      if (y === 0) return x; // top
      if (x === this.#maxX) return this.#maxX + y; // right
      if (y === this.#maxY) return this.#maxX + this.#maxY + (this.#maxX - x); // bottom
      if (x === 0) return 2 * this.#maxX + this.#maxY + (this.#maxY - y); // left
      return null;
    }

    pointFromBorderPosition(t) {
      const p = 2 * (this.#maxX + this.#maxY);
      t = ((t % p) + p) % p;

      if (t <= this.#maxX) return [t, 0];
      t -= this.#maxX;

      if (t <= this.#maxY) return [this.#maxX, t];
      t -= this.#maxY;

      if (t <= this.#maxX) return [this.#maxX - t, this.#maxY];
      t -= this.#maxX;

      return [0, this.#maxY - t];
    }

    getCornerPositions() {
      return [
        0,
        this.#maxX,
        this.#maxX + this.#maxY,
        2 * this.#maxX + this.#maxY,
      ];
    }

    borderPathBetween(a, b, clockwise = true) {
      const p = 2 * (this.#maxX + this.#maxY);
      const ta = this.borderPosition(a);
      const tb = this.borderPosition(b);

      if (ta == null || tb == null) return [];

      let start = ta;
      let end = tb;

      if (clockwise) {
        if (end < start) end += p;
      } else {
        if (start < end) start += p;
        [start, end] = [end, start];
      }

      const corners = this.getCornerPositions();
      const points = [a];

      for (const c of corners) {
        let cc = c;
        if (cc <= start) cc += p;
        if (cc > start && cc < end) {
          points.push(this.pointFromBorderPosition(cc));
        }
      }

      points.push(b);
      return points;
    }

    updateStatus() {
      if (this.#xAxisShape.display) {
        this.#xAxisShape.x1 = this.#borderWidth;
        this.#xAxisShape.y1 = this.drawOffset.y + this.#borderWidth;
        this.#xAxisShape.x2 = this.width - this.#borderWidth;
        this.#xAxisShape.y2 = this.drawOffset.y + this.#borderWidth;
        this.updateShape(this.#xAxisShape);
      }

      if (this.#yAxisShape.display) {
        this.#yAxisShape.x1 = this.drawOffset.x + this.#borderWidth;
        this.#yAxisShape.y1 = this.#borderWidth;
        this.#yAxisShape.x2 = this.drawOffset.x + this.#borderWidth;
        this.#yAxisShape.y2 = this.height - this.#borderWidth;
        this.updateShape(this.#yAxisShape);
      }

      if (this.#xGridShape.display) {
        this.#xGridShape.d = '';
        const
          from = this.#borderWidth, 
          to = this.width - this.#borderWidth;
        for (let y = this.#borderWidth, yf = this.height - this.#borderWidth; y < yf; y++) {
          this.#xGridShape.d += `M ${from} ${y} L ${to} ${y} `;
        } 
        this.updateShape(this.#xGridShape);
      }

      if (this.#yGridShape.display) {
        this.#yGridShape.d = '';
        const
          from = this.#borderWidth, 
          to = this.height - this.#borderWidth;
        for (let x = this.#borderWidth, xf = this.width - this.#borderWidth; x < xf; x++) {
          this.#yGridShape.d += `M ${x} ${from} L ${x} ${to} `;
        }
        this.updateShape(this.#yGridShape);
      }

      if (!this.#input) {
        return;
      }

      let status = this.#input.status;
      if (!Array.isArray(status)) {
        return;
      }

      let dotsShape = this.getShape('dots');
      let pathShape = this.getShape('path');

      const
        ox = this.drawOffset.x,
        oy = this.drawOffset.y,
        sx = this.drawScale.x,
        sy = this.drawScale.y;
      this.#maxX = this.width - 1;
      this.#maxY = this.height - 1;

      const values = status
        .filter(v => v && (typeof v.x === 'number' || typeof v[0] === 'number') && (typeof v.y === 'number' || typeof v[1] === 'number'))
        .map(v => [v.x ?? v[0], v.y ?? v[1]])
        .map(v => [v[0] * sx + ox, v[1] * sy + oy]);

      if (this.connectThePoints) {
        const pathValues = [...values];
        if (this.closePath) {
          pathValues.push(values[0]);
        }

        const connectedPoints = [];
        let i = 0,
          l = pathValues.length,
          aux = pathValues[i++],
          auxOuther = aux[0] < 0 || aux[0] > this.#maxX || aux[1] < 0 || aux[1] > this.#maxY,
          value,
          valueOuther;
        while (i < l) {
          value = pathValues[i++];
          valueOuther = value[0] < 0 || value[0] > this.#maxX || value[1] < 0 || value[1] > this.#maxY;

          if (auxOuther || valueOuther) {
            const clipped = this.clipSegment(aux, value);
            if (clipped) {
              connectedPoints.push(...clipped);
            } else {
              const aux1 = this.clampToRect(aux);
              const value1 = this.clampToRect(value);

              const borderPoints = this.borderPathBetween(aux1, value1, true);

              for (const point of borderPoints) {
                if (
                  connectedPoints.length === 0 ||
                  connectedPoints[connectedPoints.length - 1][0] !== point[0] ||
                  connectedPoints[connectedPoints.length - 1][1] !== point[1]
                ) {
                  connectedPoints.push(point);
                }
              }
            }
          } else {
            connectedPoints.push(value);
          }

          aux = value;
          auxOuther = valueOuther;
        }

        pathShape.d = 'M ' + connectedPoints
          .filter(v => v)
          .map(v => {
            return `${v[0]} ${v[1]}`;
          }).join(' L ');
        if (this.closePath) {
          pathShape.d += ' Z';
        }
      } else {
        pathShape.display = false;
      }

      dotsShape.children = values
        .filter(v => v[0] >= 0 && v[0] <= this.#maxX && v[1] >= 0 && v[1] <= this.#maxY)
        .map((v, i) => ({
          shape: 'circle',
          x: v[0],
          y: v[1],
          r: .1,
          fill: this.#color,
          stroke: false,
        }));

      this.updateShape(dotsShape);
      this.updateShape(pathShape);

      if (this.#axis.x) {
        let xAxisShape = this.getShape('xAxis');
        xAxisShape.x1 = .5;
        xAxisShape.y1 = oy + .5;
        xAxisShape.x2 = this.width - .5;
        xAxisShape.y2 = oy + .5;
        this.updateShape(xAxisShape);
      }

      if (this.#axis.y) {
        let yAxisShape = this.getShape('yAxis');
        yAxisShape.x1 = ox + .5;
        yAxisShape.y1 = .5;
        yAxisShape.x2 = ox + .5;
        yAxisShape.y2 = this.height - .5;
        this.updateShape(yAxisShape);
      }
    }
  };
}