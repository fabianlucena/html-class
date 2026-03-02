import { assignDeep } from '../utils/object.js';

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
      { name: 'o', type: 'out', x: 1, y: 0, direction: 'right', extends: 'tiny' },
    ];

    static variants = [
      {
        name: 'vertical',
        _label: 'Vertical',
        data: {
          rotate: 0,
          connector: {
            direction: 0,
            x: .5,
            y: 0,
          },
        },
      },
      {
        name: 'horizontal',
        _label: 'Horizontal',
        data: {
          rotate: -90,
          shape: { x: 0 },
          connector: {
            direction: -90,
            x: 0,
            y: 1,
          },
        },
      },
      {
        name: 'inverted',
        _label: 'Inverted',
        data: {
          rotate: 180,
          connector: {
            direction: 180,
            x: -.5,
            y: 0,
          },
        },
      },
      {
        name: 'rotated',
        _label: 'Rotated',
        data: {
          rotate: 90,
          connector: {
            direction: 90,
            x: 0,
            y: -1,
          },
        },
      },
    ];

    saveStatus = true;
    #connector = null;

    init() {
      super.init(...arguments);
      this.#connector = this.getConnector('o');
      if (!this.variant)
        this.variant = 'vertical';
    }

    update() {
      super.update();
      assignDeep(this, this.variant?.data);
      this.updateKnob();
    }

    setVariant(value) {
      super.variant = value;
      if (!this.isInitializing)
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