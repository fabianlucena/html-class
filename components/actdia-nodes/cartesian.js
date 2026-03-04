import { getColors } from '../utils/color.js';

export default function create({ Node }) {
  return class Cartesian extends Node {
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
    #dx = 0;
    #dy = 0;
    #xAxis = true;
    #yAxis = true;

    get dx() {
      return this.#dx;
    }

    set dx(value) {
      this.#dx = value;
      this.updateStatus();
    }

    get dy() {
      return this.#dy;
    }

    set dy(value) {
      this.#dy = value;
      this.updateStatus();
    }

    get xAxis() {
      return this.#xAxis;
    }

    set xAxis(value) {
      this.#xAxis = value;
      this.shape.children[1].stroke = value ? '#00FF00' : false;
      this.updateShape(this.shape.children[1]);
    }

    get yAxis() {
      return this.#yAxis;
    }

    set yAxis(value) {
      this.#yAxis = value;
      this.shape.children[1].stroke = value ? '#00FF00' : false;
      this.updateShape(this.shape.children[1]);
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

    update() {
      super.update(...arguments);

      this.shape.children[0].width = this.width;
      this.shape.children[0].height = this.height;
      this.shape.children[1].width = this.width;
      this.shape.children[1].height = this.height;

      this.#dx = this.width / 2;
      this.#dy = this.height / 2;
      this.updateStatus();
    }

    updateStatus() {
      let status = this.#input.status;
      if (!Array.isArray(status)) {
        return;
      }

      let dotsShape = this.getShape('dots');
      let pathShape = this.getShape('path');

      let colors = getColors(status.length);

      pathShape.d = 'M ' + status.map(s => `${this.#dx + s[0]} ${this.#dy - s[1]}`).join(' L ') + ' Z';
      dotsShape.children = status.map((s, i) => ({
        shape: 'circle',
        x: this.#dx + s[0],
        y: this.#dy - s[1],
        r: .2,
        fill: colors[i],
        stroke: false,
      }));

      this.updateShape(dotsShape);
      this.updateShape(pathShape);

      if (this.#xAxis) {
        let xAxisShape = this.getShape('xAxis');
        xAxisShape.x1 = 0.5;
        xAxisShape.y1 = this.#dy;
        xAxisShape.x2 = this.width - 0.5;
        xAxisShape.y2 = this.#dy;
        this.updateShape(xAxisShape);
      }

      if (this.#yAxis) {
        let yAxisShape = this.getShape('yAxis');
        yAxisShape.x1 = this.#dx;
        yAxisShape.y1 = 0.5;
        yAxisShape.x2 = this.#dx;
        yAxisShape.y2 = this.height - 0.5;
        this.updateShape(yAxisShape);
      }
    }
  };
}