import { assignDeep } from '../utils/object.js';

export default function create({ Node }) {
  return class Switch extends Node {
    shape = {
      x: -.5,
      y: -0,
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
      x: -1,
      y: -1,
      width: 1,
      height: 2,
    };

    connectors = [
      { name: 'o', type: 'out', x: 0, y: 0, direction: 'right', extends: 'tiny' },
    ];

    static variants = [
      {
        name: 'vertical',
        _label: 'Vertical',
        data: {
          rotate: 0,
          shape: {
            x: -.5,
            y: -0,
          },
          box: {
            x: -1,
            y: -1,
          },
          connector: {
            direction: 0,
          },
        },
      },
      {
        name: 'horizontal',
        _label: 'Horizontal',
        data: {
          rotate: 90,
          shape: {
            x: 0,
            y: 1,
          },
          box: {
            x: -.5,
            y: 0,
          },
          connector: {
            direction: 90,
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
      assignDeep(this, this.getVariant()?.data);
      super.update();
      this.updateKnob();
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