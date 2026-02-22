export default function create({ Node }) {
  return class Text extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          text: '¡Hola mundo!',
          lineSpacing: 1.0,
          fillOpacity: 1,
          textAnchor: 'center',
          dominantBaseline: 'top',
          editable: true,
          onInput: evt => {
            this.isEditing = true;
            this.text = evt.data;
          },
          onBlur: () => this.isEditing = false,
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
        name: 'shape.children[1].textAnchor',
        type: 'select',
        _label: 'Text anchor',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        name: 'shape.children[1].dominantBaseline',
        type: 'select',
        _label: 'Text vertical align',
        options: [
          { value: 'top', label: 'Top' },
          { value: 'middle', label: 'Middle' },
          { value: 'bottom', label: 'Bottom' },
        ],
      },
      {
        name: 'shape.children[1].fill',
        type: 'color',
        _label: 'Text color',
        nullable: true,
      },
      {
        name: 'shape.children[1].fillOpacity',
        type: 'range',
        _label: 'Text opacity',
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        name: 'autoSize',
        type: 'checkbox',
        _label: 'Auto size',
      },
      {
        name: 'shape.children[0].rx',
        type: 'number',
        step: 0.1,
        _label: 'Border radius x',
      },
      {
        name: 'shape.children[0].ry',
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
        if (this.svgShape)
          this.update();
      }
    }

    get text() {
      return this.shape.children[1].text;
    }
    
    set text(value) {
      if (this.shape.children[1].text !== value) {
        this.shape.children[1].text = value;
        if (this.shape.children[1].svgElement)
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
      this.shape.children[0].width = value;
      this.shape.children[1].width = value;
      this.#autoSize = false;
      super.setWidth(value);
    }

    setHeight(value) {
      this.#autoSize = false;
      this.shape.children[0].height = value;
      this.shape.children[1].height = value;
      super.setHeight(value);
    }

    update() {
      this.autoSize = true;
      let svgText = this.shape.children[1]?.svgElement;
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

          this.shape.children[1].y = this.padding.top;
          this.shape.children[0].width = this.box.width;
          this.shape.children[0].height = this.box.height;
        }

        if (this.isEditing) {
          let x;
          if (this.shape.children[1].textAnchor === 'center'
            || this.shape.children[1].textAnchor === 'middle'
          ) {
            x = this.box.width / 2;
          } else if (this.shape.children[1].textAnchor === 'right'
            || this.shape.children[1].textAnchor === 'end'
          ) {
            x = this.box.width - this.padding.right;
          }

          if (x) {
            this.shape.children[1].x = x;
            [...svgText.children]?.forEach(child => {
              child.setAttribute('x', x);
            });
          }

          this.actdia.tryUpdateShape(this.shape.children[0]);
          this.actdia.tryUpdateShape(this.shape.children[1], { skipChildren: true });
          this.actdia.updateItemSelectionBox(this);

          return;
        }
      }

      super.update();
    }
  };
}
