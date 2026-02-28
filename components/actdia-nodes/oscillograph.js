import { getColors } from '../utils/color.js';

export default function create({ Node, _ }) {
  return class Oscillograph extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 12,
          height: 12,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'rect',
          x: 0.5,
          y: 0.5,
          width: 11,
          height: 11,
          rx: .2,
          ry: .2,
          fill: 'black',
        },
        {
          x: 0.6,
          children: [],
        },
        {
          x: 0.5,
          y: 0.5,
          children: [],
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 12,
      height: 12,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 2, direction: 'left' },
    ];

    #height = 6;
    #width = 20;
    #scaleX = .1;
    #matrix = [];
    #min = [];
    #max = [];
    #range = [];
    #interval = null;

    get height() {
      return this.#height;
    }

    set height(value) {
      this.#height = value;
      this.update();
    }

    get width() {
      return this.#width;
    }

    set width(value) {
      this.#width = value;
      this.update();
    }

    get scaleX() {
      return this.#scaleX;
    }

    set scaleX(value) {
      this.#scaleX = value;
      this.updateStatus();
    }

    constructor(params) {
      super(params);
    }

    update() {
      this.box.width = this.#width;
      this.box.height = this.#height;

      this.shape.children[0].width = this.#width;
      this.shape.children[0].height = this.#height;
      this.shape.children[1].width = this.#width - 1;
      this.shape.children[1].height = this.#height - 1;

      if (this.#interval) {
        clearInterval(this.#interval);
        this.#interval = null;
      }

      this.#interval = setInterval(() => {
        this.draw();
      }, 20);

      super.update();
    }

    updateStatus() {
      let status = this.connectors[0].status;
      if (!Array.isArray(status)) {
        status = [status];
      }
      
      while (this.shape.children[2].children.length > status.length) {
        this.shape.children[2].children.pop();
      }

      while (this.shape.children[3].children.length > status.length) {
        this.shape.children[3].children.pop();
      }

      const svgTextElement = this.svgShape?.children?.[2];
      while (svgTextElement?.children?.length > status.length) {
        svgTextElement.removeChild(svgTextElement.children[svgTextElement.children.length - 1]);
      }

      const svgDrawElement = this.svgShape?.children?.[3];
      while (svgDrawElement?.children?.length > status.length) {
        svgDrawElement.removeChild(svgDrawElement.children[svgDrawElement.children.length - 1]);
      }
      
      let length = this.#matrix[0]?.length || 0;
      let last = length - 1;      

      let drawColors, textColors;
      let needUpdate = false;
      const count = status.length;
      const sy = (this.#height - 1) / count;

      for (let i = 0; i < count; i++) {
        let value = status[i];
        if (value === true)
          value = 1;
        else if (value === false)
          value = 0;
        else if (isNaN(value))
          value = 0;

        this.#matrix[i] ??= Array(length).fill(value);
        if (last >= 0) {
          this.#matrix[i][last] = value ?? this.#matrix[i][last - 1];
        } else {
          this.#matrix[i][0] = value;
        }
        
        this.#min[i] = Math.min(this.#min[i] ?? value, value);
        this.#max[i] = Math.max(this.#max[i] ?? value, value);
        this.#range[i] = this.#max[i] - this.#min[i];
        this.#range[i] ||= 1;

        this.tryUpdateShape(this.shape.children[2]);

        let textShape = this.shape.children[2].children[i];
        if (!textShape) {
          textColors ||= getColors(count, 90, 100, 75);
          this.shape.children[2].children[i] = {
            parent: this.shape.children[2],
            shape: 'text',
            fill: textColors[i],
            text: 'Hola',
            fontSize: .6,
            textAnchor: 'start',
            dominantBaseline: 'top',
          };
          textShape = this.shape.children[2].children[i];
        }
        textShape.y = i * sy + .6;
        textShape.text = _('[%s •• %s] %s', this.#min[i].toFixed(2), this.#max[i].toFixed(2), value.toFixed(2));

        let drawShape = this.shape.children[3].children[i];
        if (!drawShape) {
          drawColors ||= getColors(count, 90);
          this.shape.children[3].children[i] = {
            parent: this.shape.children[3],
            shape: 'path',
            fill: false,
            stroke: drawColors[i],
          };
          drawShape = this.shape.children[3].children[i];
        }
        drawShape.y = i * sy + .1;

        if (!needUpdate && !this.tryUpdateShape(textShape)) {
          needUpdate = true;
        }
      }

      if (needUpdate) {
        this.update();
      }
    }

    draw() {
      const count = this.#matrix.length;
      let length = this.#matrix[0]?.length || 0;
      let last = length - 1;
      const sy = (this.#height - 1) / count;
      const ssy = sy * .9;
      let needUpdate = false;

      if (length === 0) {
        for (let i = 0; i < count; i++) {
          this.#matrix[i] = [0];
        }
      } else {
        for (let i = 0; i < count; i++) {
          this.#matrix[i].push(this.#matrix[i][last]);
        }
      }

      length++;
      last++;

      for (let i = 0; i < count; i++) {
        let shape = this.shape.children[3].children[i];
        shape.d = '';

        for (let k = 0; k < length; k++) {
          let value = this.#matrix[i][k];
          let x = k * this.scaleX;
          let y = (1 - (value - this.#min[i]) / this.#range[i]) * ssy;
          if (x > this.#width - 1) {
            this.#matrix[i].shift();
            break;
          }

          shape.d += ` L ${x} ${y}`;
        }

        shape.d = 'M' + shape.d.substring(2);

        if (!needUpdate && !this.tryUpdateShape(shape)) {
          needUpdate = true;
        }
      }

      if (needUpdate) {
        this.update();
      }
    }
  };
}