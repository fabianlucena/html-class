export default function create({ Node }) {
  return class Text extends Node {
    shape = {
      shapes: [
        {
          shape: 'rect',
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          text: '¡Hola mundo!',
          lineSpacing: 1.0,
          y: 1,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 10,
      height: 2,
    };

    connectors = [];

    fields = [
      {
        name: 'text',
        type: 'textarea',
        _label: 'Text',
      },
      {
        name: 'autoSize',
        type: 'checkbox',
        _label: 'Auto size',
      },
      {
        name: 'shapes[0].rx',
        type: 'number',
        step: 0.1,
        _label: 'Border radius x',
      },
      {
        name: 'shapes[0].ry',
        type: 'number',
        step: 0.1,
        _label: 'Border radius y',
      },
      {
        name: 'padding.top',
        type: 'number',
        step: 0.1,
        _label: 'Padding top',
      },
      {
        name: 'padding.right',
        type: 'number',
        step: 0.1,
        _label: 'Padding right',
      },
      {
        name: 'padding.bottom',
        type: 'number',
        step: 0.1,
        _label: 'Padding bottom',
      },
      {
        name: 'padding.left',
        type: 'number',
        step: 0.1,
        _label: 'Padding left',
      },
    ];

    #autoSize = true;
    #padding = {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
    };

    canChangeWidth = true;
    canChangeHeight = true;

    get autoSize() {
      return this.#autoSize;
    }
    
    set autoSize(value) {
      if (this.#autoSize !== value) {
        this.#autoSize = value
        this.update();
      }
    }

    get text() {
      return this.shape.shapes[1].text;
    }
    
    set text(value) {
      if (this.shape.shapes[1].text !== value) {
        this.shape.shapes[1].text = value;
        this.update();
      }
    }

    get padding() {
      return this.#padding;
    }

    set padding(value) {
      if (this.#padding !== value) {
        this.#padding = value;
        this.update();
      }
    }

    setWidth(value) {
      this.shape.shapes[0].width = value;
      this.#autoSize = false;
      super.setWidth(value);
    }

    setHeight(value) {
      this.#autoSize = false;
      this.shape.shapes[0].height = value;
      super.setHeight(value);
    }

    update() {
      if (this.autoSize && this.svgShape) {
        const bbox = this.svgShape.children[1].getBBox();
        this.box.width = bbox.width + this.padding.right + this.padding.left;
        this.box.height = bbox.height + this.padding.top + this.padding.bottom;
        this.shape.shapes[0].width = this.box.width;
        this.shape.shapes[0].height = this.box.height;
      }
      
      super.update();
    }
  };
}
