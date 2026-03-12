const input = document.createElement('input');
input.style.position = 'absolute';
input.style.left = '35em';
input.style.top = '2em';
//input.style.opacity = 0;
//input.style.zIndex = -1;
document.body.appendChild(input);

export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class Terminal extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          rx: .1,
          ry: .1,
          width: 10,
          height: 3,
        },
        {
          shape: 'rect',
          rx: .2,
          ry: .2,
          x: .5,
          y: .5,
          fill: '#00000080',
          width: 9,
          height: 2,
        },
        {
          shape: 'text',
          text: '$ ',
          x: .5,
          y: .5,
          lineSpacing: 1.0,
          fillOpacity: 1,
          textAnchor: 'left',
          dominantBaseline: 'top',
          width: 9,
          height: 2,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 10,
      height: 3,
    };

    connectors = [
      { name: 'port', type: 'io', x: 0, y: 1, direction: 'left' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

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

    constructor(...args) {
      super(...args);
      input.addEventListener('keydown', evt => this.keyDownHandler(evt));
    }

    update() {
      let textShape = this.shape.children[1];
      if (textShape) {
        let svgText = textShape?.svgElement;
        if (svgText) {
          if (this.autoSize) {
            const lines = this.text.split('\n');
            const lastLine = lines[lines.length - 1];
            const bbox = svgText.getBBox();

            this.box.width = bbox.width + this.padding.right + this.padding.left;
            this.box.height = bbox.height + this.padding.top + this.padding.bottom;
            if (lastLine.trim().length <= 0) {
              bbox.height++;
            }

            textShape.y = this.padding.top;
            this.shape.children[0].width = this.box.width;
            this.shape.children[0].height = this.box.height;
          }

          this.tryUpdateShape(this.shape.children[0]);
          this.tryUpdateShape(textShape, { skipChildren: true });
          this.actdia.updateItemSelectionBox(this);
        }
      }

      if (this.isEditing) {
        return;
      }

      super.update();
    }

    keyDownHandler(evt) {
      this.setStatus(evt.key, { force: true });
    }
  };
}
