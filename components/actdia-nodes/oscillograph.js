import { getColors } from '../utils/color.js';

export default function create({ Node, _ }) {
  return class Oscillograph extends Node {
    shape = {
      shapes: [
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
          shapes: [],
        },
        {
          x: 0.5,
          y: 0.5,
          shapes: [],
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

      this.shape.shapes[0].width = this.#width;
      this.shape.shapes[0].height = this.#height;
      this.shape.shapes[1].width = this.#width - 1;
      this.shape.shapes[1].height = this.#height - 1;

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

      while (this.shape.shapes[3].shapes.length > status.length) {
        this.shape.shapes[3].shapes.pop();
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

        this.shape.shapes[2].text = _('Max: %s, min: %s', this.#max[i].toFixed(2), this.#min[i].toFixed(2));
        this.actdia.tryUpdateShape(
          this,
          this.svgShape?.children?.[2],
          this.shape.shapes[2]
        );

        let shape = this.shape.shapes[2].shapes[i];
        if (!shape) {
          textColors ||= getColors(count, 90, 100, 75);
          this.shape.shapes[2].shapes[i] = {
            shape: 'text',
            fill: textColors[i],
            text: 'Hola',
            fontSize: .6,
            textAnchor: 'start',
            dominantBaseline: 'top',
          };
          shape = this.shape.shapes[2].shapes[i];
        }
        shape.y = i * sy + .6;
        shape.text = _('%s •• %s', this.#max[i].toFixed(2), this.#min[i].toFixed(2));

        let drawShape = this.shape.shapes[3].shapes[i];
        if (!drawShape) {
          drawColors ||= getColors(count, 90);
          this.shape.shapes[3].shapes[i] = {
            shape: 'path',
            fill: false,
            stroke: drawColors[i],
          };
          drawShape = this.shape.shapes[3].shapes[i];
        }
        drawShape.y = i * sy + .1;

        if (!needUpdate) {
          if (svgTextElement?.children?.[i]) {
            this.actdia.tryUpdateShape(
              this,
              svgTextElement?.children?.[i],
              shape
            );
          } else {
            needUpdate = true;
          }
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
      const svgDrawElement = this.svgShape?.children?.[3];
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
        let shape = this.shape.shapes[3].shapes[i];
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

        if (!needUpdate) {
          if (svgDrawElement?.children?.[i]) {
            this.actdia.tryUpdateShape(
              this,
              svgDrawElement?.children?.[i],
              shape
            );
          } else {
            needUpdate = true;
          }
        }
      }

      if (needUpdate) {
        this.update();
      }
    }
  };
}