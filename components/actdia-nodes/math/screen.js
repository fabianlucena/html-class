import { getColors } from '../../utils/color.js';

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
          stroke: '#00FF00',
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

      let colors = getColors(status.length);

      const
        ox = this.drawOffset.x,
        oy = this.drawOffset.y,
        sx = this.drawScale.x,
        sy = this.drawScale.y;

      const values = status
        .filter(v => v && (typeof v.x === 'number' || typeof v[0] === 'number') && (typeof v.y === 'number' || typeof v[1] === 'number'))
        .map(v => [v.x ?? v[0], v.y ?? v[1]])
        .map(v => [v[0] * sx + ox, v[1] * sy + oy])
        .filter(v => v[0] >= 0 && v[0] <= this.width && v[1] >= 0 && v[1] <= this.height);

      if (this.connectThePoints) {
        pathShape.d = 'M ' + values
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
        .map((v, i) => ({
          shape: 'circle',
          x: v[0],
          y: v[1],
          r: .2,
          fill: colors[i],
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