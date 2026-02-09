export default function create({ Node }) {
  return class Pushbutton extends Node {
    shape = {
      x: 0,
      y: -.5,
      width: 1,
      height: 1,
      shapes: [
        {
          shape: 'rect',
          width: 1,
          height: 1,
          rx: .2,
          ry: .2,
        },
        {
          name: 'knob',
          shape: 'circle',
          x: .5,
          y: .5,
          r: .35,
          fill: 'darkred',
          stroke: 'darkred',
        },
      ],
    };

    box = {
      x: 0,
      y: -.5,
      width: 1,
      height: 1,
    };

    connectors = [
      { name: 'o0', type: 'out', x: 1, y: 0, direction: 'right', extends: 'tiny' },
    ];

    updateKnob() {
      const shape = this.shape.shapes[1] ??= {};
      if (this.status) {
        shape.fill = 'lightgreen';
        shape.stroke = 'darkgreen';
      } else {
        shape.fill = '#800000';
        shape.stroke = '#400000';
      }

      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }

    onMouseDown({ evt, item, shape }) {
      if (this.status
        || !item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || shape?.name !== 'knob'
      )
        return;

      this.setStatus(1);
      this.updateKnob();

      evt.preventDefault();
      evt.stopPropagation();
    }

    onMouseUp({ evt, item, shape }) {
      if (!this.status
        || !item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || shape?.name !== 'knob'
      )
        return;

      this.setStatus(0);
      this.updateKnob();

      evt.preventDefault();
      evt.stopPropagation();
    }

    onClick({ evt, item, shape }) {
      if (!item.actdia
        || evt.button !== 0
        || evt.ctrlKey
        || evt.shiftKey
        || evt.altKey
        || shape?.name !== 'knob'
      )
        return;

      evt.preventDefault();
      evt.stopPropagation();
    }
  };
}