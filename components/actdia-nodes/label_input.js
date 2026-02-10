export default function create({ Node, actdia }) {
  actdia.globalData ??= {};
  actdia.globalData.labeledStatus ??= {};

  return class LabelInput extends Node {
    static label = 'Label input';

    shape = {
      shapes: [
        {
          y: -.5,
          shape: 'path',
          d: 'M .5 0 H 5 V 1 H .5 L 0 .5 L 0.5 0',
        },
        {
          shape: 'text',
          y: -.5,
          x: .5,
          width: 4.5,
          height: 1,
          text: 'No label',
        }
      ],
    };

    label = 'No label';

    box = {
      x: 0,
      y: -.5,
      width: 5,
      height: 1,
    };

    connectors = [
      { name: 'i', type: 'in', x: 0, y: 0, direction: 'left', extends: 'tiny' },
    ];

    fieldsDefinition = [
      {
        name: 'label',
        type: 'text',
        _label: 'Label',
      },
    ];
    
    update() {
      this.shape.shapes[1].text = this.label;
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }

    updateStatus(options = {}) {
      this.setStatus(this.connectors.find(c => c.type === 'in')?.status, options);
    }

    statusUpdated() {
      super.statusUpdated();
      this.updateForStatus();
      actdia.globalData.labeledStatus[this.label] = this.status;
      actdia.globalData.labeledStatusUpdated?.(this.label);
    }

    updateForStatus() {
      const shape = this.shape.shapes[0] ??= {};
      if (isNaN(this.status)) {
        shape.className = 'updated';
        setTimeout(() => {
          if (shape.className === 'updated') {
            shape.className = '';
            this.actdia?.tryUpdateShape(this, this.svgShape?.children?.[0], this.shape.shapes[0]);
          }
        }, 250);
      } else {
        if (this.status > 0.5) {
          shape.className = 'hi';
        } else {
          shape.className = 'lo';
        }
      }

      this.actdia?.tryUpdateShape(this, this.svgShape?.children?.[0], this.shape.shapes[0]);
    }
 };
}