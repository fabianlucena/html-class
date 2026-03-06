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
          name: 'xAxis',
          shape: 'line',
          x1: 0.5,
          y1: 0.5,
          x2: 19.5,
          y2: 0.5,
          stroke: '#80FF80',
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
          stroke: '#8080FF',
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
    #drawOffset = { x: 0, y: 0 };
    #drawScale = { x: 1, y: 1 };
    #axis = { x: false, y: false };
    #autoOffset = false;
    #connectThePoints = true;
    #closePath = true;
    #color = '#ffd152';

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
      this.#axis.x = value.x ?? value[0] ?? !!value;
      this.#axis.y = value.y ?? value[1] ?? !!value;

      const xAxisShape = this.getShape('xAxis');
      const yAxisShape = this.getShape('yAxis');

      xAxisShape.display = value.x;
      yAxisShape.display = value.y;
      if (update) {
        if (!this.#axis.x)
          this.updateShape(xAxisShape);

        if (!this.#axis.y)
          this.updateShape(yAxisShape);

        if (this.#axis.x || this.#axis.y)
          this.updateStatus();
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

    clipSegment(p1, p2, maxX, maxY) {
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
        clip(-dx, x1) &&          // x >= 0
        clip(dx, maxX - x1) &&    // x <= maxX
        clip(-dy, y1) &&          // y >= 0
        clip(dy, maxY - y1)       // y <= maxY
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

    updateStatus() {
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
        sy = this.drawScale.y,
        maxX = this.width - 1,
        maxY = this.height - 1;

      const values = status
        .filter(v => v && (typeof v.x === 'number' || typeof v[0] === 'number') && (typeof v.y === 'number' || typeof v[1] === 'number'))
        .map(v => [v.x ?? v[0], v.y ?? v[1]])
        .map(v => [v[0] * sx + ox, v[1] * sy + oy]);

      if (this.connectThePoints) {
        const connectedPoints = [];
        let aux1, aux2, clipped;
        for (const value of values) {
          if (value[0] <= 0 || value[0] >= maxX || value[1] <= 0 || value[1] >= maxY) {
            if (aux2) {
              const clipped = this.clipSegment(value, aux2, maxX, maxY);
              if (clipped) {
                connectedPoints.push(clipped[0]);
              }

              aux2 = null;
            }

            aux1 = value;
            clipped = true;
          } else {
            if (aux1) {
              const clipped = this.clipSegment(aux1, value, maxX, maxY);
              if (clipped) {
                connectedPoints.push(clipped[0]);
              }
              
              aux1 = null;
            }

            connectedPoints.push(value);
            aux2 = value;
          }
        }

        if (!connectedPoints.length) {
          for (let i = 0, j = 1, e = values.length; j < e; i++, j++) {
            const clipped = this.clipSegment(values[i], values[j], maxX, maxY);
            if (clipped) {
              connectedPoints.push(...clipped);
            }
          }
        }

        pathShape.d = 'M ' + connectedPoints
          .filter(v => v)
          .map(v => {
            return `${v[0]} ${v[1]}`;
          }).join(' L ');
        if (this.closePath && !clipped) {
          pathShape.d += ' Z';
        }
      } else {
        pathShape.display = false;
      }

      dotsShape.children = values
        .filter(v => v[0] >= 0 && v[0] <= maxX && v[1] >= 0 && v[1] <= maxY)
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