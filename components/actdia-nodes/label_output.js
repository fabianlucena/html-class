export default function create({ Node, actdia }) {
  actdia.addLabeledStatusListener((label, status) => {
    const outputs = actdia.items
      .filter(i => i.elementClass === 'LabelOutput' && i.label === label);

    outputs.forEach(item => item.updateStatus(status));
  });

  return class LabelOutput extends Node {
    static label = 'Label output';

    shape = {
      children: [
        {
          y: -.5,
          shape: 'path',
          d: 'M 0 0 H 4.5 L 5 .5 L 4.5 1 H 0 Z',
        },
        {
          shape: 'text',
          y: -.5,
          x: 0,
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
      { name: 'o', type: 'out', x: 5, y: 0, direction: 'right', extends: 'tiny' },
    ];

    fields = [
      {
        name: 'label',
        type: 'text',
        _label: 'Label',
        isTool: true,
      },
    ];

    construct() {
      super.construct();
      window.labeledStatus[this.label] = null;
    }

    update() {
      this.shape.children[1].text = this.label;
      this.tryUpdateShape(this.shape.children[1]);
    }

    updateStatus(newStatus, options = {}) {
      this.setStatus(newStatus, options);
    }

    statusUpdated() {
      super.statusUpdated(...arguments);
      this.updateForStatus();
    }

    updateForStatus() {
      const shape = this.shape.children[0] ??= {};
      if (isNaN(this.status)) {
        shape.className = 'updated';
        setTimeout(() => {
          if (shape.className === 'updated') {
            shape.className = '';
            this.tryUpdateShape(this.shape.children[0]);
          }
        }, 250);
      } else {
        if (this.status > 0.5) {
          shape.className = 'hi';
        } else {
          shape.className = 'lo';
        }
      }

      this.tryUpdateShape(this.shape.children[0]);
    }
 };
}