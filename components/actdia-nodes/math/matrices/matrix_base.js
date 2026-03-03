export default function create({ Node, _f }) {
  return class MatrixBase extends Node {
    static _label = _f('Matrix base');

    shape = {
      children: [
        {
          shape: 'rect',
          name: 'box',
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          name: 'texts',
          children: [],
        },
      ],
    };

    box = {
      width: 2,
      height: 2,
    };

    fields = [
      {
        name: 'rows',
        type: 'number',
        min: 1,
        step: 1,
        _label: _f('Rows'),
        isTool: true,
      },
      {
        name: 'columns',
        type: 'number',
        min: 1,
        step: 1,
        _label: _f('Columns'),
        isTool: true,
        setValue: value => this.dimension = [this.dimension[0], value],
      },
    ];
    
    autoPropagate = true;

    #dimension = [2, 2];
    #textsShapes = null;
    #boxShape = null;

    get dimension() {
      return this.#dimension;
    }

    set dimension(value) {
      this.#dimension = value;
      this.update();
    }

    get rows() {
      return this.#dimension[1];
    }

    get columns() {
      return this.#dimension[0];
    }

    set rows(value) {
      this.dimension = [this.#dimension[0], value];
    }

    set columns(value) {
      this.dimension = [value, this.#dimension[1]];
    }

    get boxShape() {
      return this.#boxShape;
    }

    get textsShapes() {
      return this.#textsShapes;
    }

    init() {
      super.init(...arguments);
      this.#boxShape = this.getShape('box');
      this.#textsShapes = this.getShape('texts');
    }

    update() {
      const width = Math.ceil(Math.max(this.columns, 1) * 2);
      const height = Math.ceil(Math.max(this.rows, 1) * .6);
      const d = (Math.max(width, height) % 2) / 2;
      this.box.x = -d;
      this.box.y = -d;
      this.box.width = width;
      this.box.height = height;
      this.boxShape.x = -d;
      this.boxShape.y = -d;
      this.boxShape.width = width;
      this.boxShape.height = height;

      let dx = width / this.columns,
        dy = height / this.rows,
        xi = -dx / 2,
        x,
        y = -dy / 2;
      for (let r = 0, k = 0; r < this.rows; r++) {
        x = xi;
        y += dy;
        for (let c = 0; c < this.columns; c++, k++) {
          let textShape = this.textsShapes.children[k];
          if (!textShape) {
            textShape = {
              parent: this.#textsShapes,
              shape: 'text',
              text: '',
              fontSize: .6,
              textAnchor: 'middle',
              editable: true,
            };

            this.#textsShapes.children[k] = textShape;
          }

          x += dx;
          textShape.x = x;
          textShape.y = y;
        }
      }

      if (!this.status
        || !Array.isArray(this.status)
        || this.status.length !== this.rows
        || this.status.some(row => !Array.isArray(row) || row.length !== this.columns)
      ) {
        this.status = [...Array(this.rows)]
          .map((_, i) => [...Array(this.columns)]
            .map((_, j) => 0)
          );
      }

      super.update();
      this.updateStatus();
    }

    updateStatus() {
      for (let r = 0, k = 0; r < this.rows; r++) {
        for (let c = 0; c < this.columns; c++, k++) {
          this.textsShapes.children[k].text = this.status[r][c].toString();
          this.tryUpdateShape(this.textsShapes.children[k]);
        }
      }

      super.updateStatus();
    }
  };
}