export default function create({ Node, _ }) {
  return class Pool extends Node {
    static _label = 'Pool';

    shape = {
      shapes: [
        {
          shape: 'rect',
          width: 30,
          height: 12,
          fill: false,
        },
        {
          shape: 'rect',
          width: 2,
          height: 12,
        },
        {
          shapes: [],
        },
        {
          shapes: [],
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 30,
      height: 12,
    };

    connectors = [];

    canChangeSize = true;

    fields = [
      {
        name: 'headerWidth',
        label: _('Header Width'),
        type: 'number',
        min: 1,
      },
      {
        name: 'lanes',
        label: _('Lanes'),
        type: 'number',
        min: 1,
      },
      {
        name: 'laneHeaders',
        label: _('Lane Headers'),
        type: 'list',
        item: {
          type: 'string',
        },
      }
    ];

    lanes = 1;
    laneHeaders = [];
    headerWidth = 2;

    setWidth(value) {
      this.shape.shapes[0].width = value;
      super.setWidth(value);
    }

    setHeight(value) {
      this.shape.shapes[0].height = value;
      this.shape.shapes[1].height = value;
      super.setHeight(value);
    }

    init() {
      super.init(...arguments);
      this.lanesShape = this.shape.shapes[2].shapes;
      this.laneHeaderShapes = this.shape.shapes[3].shapes;
    }

    update() {
      this.shape.shapes[1].width = this.headerWidth;

      if (this.laneHeaders.length > this.lanes) {
        this.laneHeaders.splice(this.lanes);
      }

      if (this.laneHeaders.length < this.lanes) {
        for (let i = this.laneHeaders.length; i < this.lanes; i++) {
          this.laneHeaders.push(_('Lane %s', i + 1));
        }
      }

      const laneHeight = this.height / this.lanes;
      for (let c = 1, i = 0; c < this.lanes; c++, i++) {
        this.lanesShape[i] = {
          shape: 'line',
          x1: 0,
          y1: laneHeight * c,
          x2: this.width,
          y2: laneHeight * c,
        };
      }

      for (let i = 0; i < this.lanes; i++) {
        this.laneHeaderShapes[i] = {
          x: this.headerWidth / 2,
          y: laneHeight * (i + .5),
          shapes: [
            {
              shape: 'text',
              x: 0,
              y: 0,
              rotate: -90,
              fontSize: 1.2,
              text: this.laneHeaders[i],
              anchor: 'center',
              dominantBaseline: 'central',
            }
          ],
        };
      }

      const lanesToRemove = this.lanesShape.length - (this.lanes - 1);
      if (lanesToRemove > 0) {
        this.lanesShape.splice(this.lanes - 1, lanesToRemove);
      }

      const laneHeadersToRemove = this.laneHeaderShapes.length - this.lanes;
      if (laneHeadersToRemove > 0) {
        this.laneHeaderShapes.splice(this.lanes, laneHeadersToRemove);
      }

      super.update();
    }
  };
}