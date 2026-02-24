export default function create({ Node }) {
  return class Switch extends Node {
    shape = {
      x: .5,
      children: [
        {
          shape: 'rect',
          x: -.5,
          y: -1,
          width: 1,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'rect',
          x: -0.3,
          y: -0.6,
          width:  0.6,
          height: 1.2,
          rx: .3,
          ry: .3,
        },
        {
          name: 'knob',
          shape: 'circle',
          x: 0,
          y: .3,
          r: .4,
          fill: 'darkred',
          stroke: 'darkred',
        },
      ],
    };

    box = {
      x: 0,
      y: -1,
      width: 1,
      height: 2,
    };

    connectors = [
      { name: 'o0', type: 'out', x: 1, y: 0, direction: 'right', extends: 'tiny' },
    ];

    fields = [
      {
        name: 'variant',
        type: 'select',
        _label: 'Variant',
        options: [
          { value: 'vertical', _label: 'Vertical' },
          { value: 'horizontal', _label: 'Horizontal' },
          { value: 'inverted', _label: 'Inverted' },
          { value: 'rotated', _label: 'Rotated' },
        ],
      },
    ];

    saveStatus = true;

    #variant = 'vertical';

    get variant() {
      return this.#variant;
    }

    static allowedVariants = ['vertical', 'horizontal', 'inverted', 'rotated'];
    set variant(value) {
      if (!Switch.allowedVariants.includes(value))
        value = 'vertical';

      this.#variant = value;

      const connector = this.connectors[0];
      switch (value) {
        case 'horizontal':
          this.rotate = -90;
          this.shape.x = 0;
          connector.direction = -90;
          connector.x = 0;
          connector.y = 1;
          break;

        case 'inverted':
          this.rotate = 180;
          connector.direction = 180;
          connector.x = -.5;
          connector.y = 0;
          break;

        case 'rotated':
          this.rotate = 90;
          connector.direction = 90;
          connector.x = 0;
          connector.y = -1;
          break;

        default:
          this.rotate = 0;
          connector.direction = 0;
          connector.x = .5;
          connector.y = 0;
      }

      this.update();
    }

    statusUpdated() {
      this.updateKnob();
      super.statusUpdated();
    }

    updateKnob() {
      const shape = this.shape.children[2] ??= {};
      if (this.status) {
        shape.fill = 'lightgreen';
        shape.stroke = 'darkgreen';
        shape.y = -.3;
      } else {
        shape.fill = '#800000';
        shape.stroke = '#400000';
        shape.y = 0.3;
      }

      this.tryUpdateShape(this.shape.children[2]);
    }

    onClick({ evt, item, shape }) {
      if (!item.actdia
        || evt.buttons !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || item.children?.some(s => s.connector)
        || shape?.name !== 'knob'
      )
        return;

      this.setStatus(!this.status);
      this.updateKnob();

      evt.preventDefault();
    }
  };
}