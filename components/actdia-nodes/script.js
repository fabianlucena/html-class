export default function create({ Node }) {
  return class Script extends Node {
    static _label = 'Script';

    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 2,
          height: 2,
          text: 'JS',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i', type:  'in', x: 0, y: 1, direction: 'left',  extends: 'small' },
      { name: 'o', type: 'out', x: 2, y: 1, direction: 'right', extends: 'small' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

    setWidth(value) {
      this.shape.shapes[0].width = value;
      this.shape.shapes[1].width = value;
      this.connectors[1].x = value;

      super.setWidth(value);
    }

    setHeight(value) {
      const dy = (value % 2) / 2;
      this.shape.y = dy;
      this.box.y = dy;

      this.shape.shapes[0].height = value;
      this.shape.shapes[1].height = value;

      const cy = value / 2 + dy;
      this.connectors[0].y = cy;
      this.connectors[1].y = cy;

      super.setHeight(value);
    }

    #script = '';
    #code = v => v;

    get script() {
      return this.#script;
    }

    set script(value) {
      this.#script = value;
    }

    fields = [
      {
        name: 'script',
        type: 'textarea',
        _label: 'JavaScript',
      },
    ];

    update() {
      this.#code = this.#script ?
        new Function('input', this.#script)
        : v => v;

      super.update();
    }

    updateStatus() {
      let value = this.inputs[0].status;
      value = this.#code(value);

      this.setStatus(value);
    }
  };
}