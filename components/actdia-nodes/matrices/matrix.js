export default function create({ Node, _f }) {
  return class Matrix extends Node {
    static _label = _f('Matrix');

    shape = {
      shapes: [
        {
          shape: 'rect',
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          text: '',
          fontSize: .6,
        },
      ],
    };

    box = {
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'o', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

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

    update() {
      const width = Math.ceil(Math.max(this.columns, 1) * 2);
      const height = Math.ceil(Math.max(this.rows, 1) * .6);
      const d = (Math.max(width, height) % 2) / 2;
      this.box.x = -d;
      this.box.y = -d;
      this.box.width = width;
      this.box.height = height;
      this.shape.shapes[0].x = -d;
      this.shape.shapes[0].y = -d;
      this.shape.shapes[0].width = width;
      this.shape.shapes[0].height = height;
      this.shape.shapes[1].x = -d + width / 2;
      this.shape.shapes[1].y = -d + height / 2;
      this.connectors[0].x = width - d;
      this.connectors[0].y = height / 2 - d;
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
      this.shape.shapes[1].text = this.status
        .map(row => row.join(' '))
        .join('\n');
      super.updateStatus();
    }
  };
}