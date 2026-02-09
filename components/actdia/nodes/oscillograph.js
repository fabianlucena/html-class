export default function create({ Node }) {
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
          x: 0.5,
          y: 0.5,
          shapes: [],
        }
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

      while (this.shape.shapes[2].shapes.length > status.length) {
        this.shape.shapes[2].shapes.pop();
      }

      const svgElement = this.svgShape?.children?.[2];
      while (svgElement?.children?.length > status.length) {
        svgElement.removeChild(svgElement.children[svgElement.children.length - 1]);
      }
      
      let length = this.#matrix[0]?.length || 0;
      let last = length - 1;

      for (let i = 0; i < status.length; i++) {
        let value = status[i];
        if (value === true)
          value = 1;
        else if (value === false)
          value = 0;
        else if (isNaN(value))
          value = 0;

        this.#matrix[i] ??= Array(length).fill(0);
        this.#matrix[i][last] = value ?? this.#matrix[i][last - 1] ?? 0;
        
        this.#min[i] = Math.min(this.#min[i] ?? value, value);
        this.#max[i] = Math.max(this.#max[i] ?? value, value);
        this.#range[i] = this.#max[i] - this.#min[i];

        let shape = this.shape.shapes[2].shapes[i];
        if (!shape) {
          this.shape.shapes[2].shapes[i] = {
            shape: 'path',
            fill: false,
            stroke: 'lime',
          };
          shape = this.shape.shapes[2].shapes[i];
        }
      }
    }

    draw() {
      const count = this.#matrix.length;
      let length = this.#matrix[0]?.length || 0;
      let last = length - 1;
      const sy = (this.#height - 1) / count;
      const ssy = sy * .9;
      const svgElement = this.svgShape?.children?.[2];

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
        let shape = this.shape.shapes[2].shapes[i];
        if (!shape) {
          this.shape.shapes[2].shapes[i] = {
            shape: 'path',
            fill: false,
            stroke: 'lime',
          };
          shape = this.shape.shapes[2].shapes[i];
        }
        shape.y = i * sy + .1;

        shape.d = '';
        for (let k = 0; k < length; k++) {
          let value = this.#matrix[i][k];
          const x = k * this.scaleX;
          const y = (1 - (value - this.#min[i]) / (this.#range[i] || 1 )) * ssy;
          if (x > this.#width - 1) {
            this.#matrix[i].shift();
            break;
          }

          shape.d += ` L ${x} ${y}`;
        }

        shape.d = 'M' + shape.d.substring(2);

        if (svgElement?.children?.[i]) {
          this.actdia.tryUpdateShape(
            this,
            svgElement?.children?.[i],
            shape
          );
        } else {
          this.update();
        }
      }
    }
  };
}