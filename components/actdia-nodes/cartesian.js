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
    }

    updateStatus() {
      let status = this.#input.status;
      if (!Array.isArray(status)) {
        return;
      }

      let dotsShape = this.getShape('dots');

      dotsShape.children = status.map((s, i) => ({
        shape: 'rect',
        x: s[0],
        y: s[1],
        width: .2,
        height: .2,
      }));

      this.updateShape(dotsShape);
    }
  };
}