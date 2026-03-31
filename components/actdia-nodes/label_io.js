export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  actdia.addLabeledStatusListener((label, status, item) => {
    const items = actdia.items
      .filter(i => i.elementClass === 'LabelIO' && i.label === label && i !== item);

    items.forEach(item => item.setStatus(status, { force: true }));
  });

  return class LabelIO extends Node {
    static label = 'Label IO';

    shape = {
      children: [
        {
          x: -3,
          y: -.5,
          shape: 'path',
          d: 'M .5 0 h 5 l .5 .5 l -.5 .5 h -5 l -.5 -.5 l .5 -.5 z',
        },
        {
          shape: 'text',
          x: -3,
          y: -.5,
          width: 6,
          height: 1,
          text: 'No label',
          textAnchor: 'center',
        },
      ],
    };

    label = 'No label';

    box = {
      x: -3,
      y: -.5,
      width: 6,
      height: 1,
    };

    connectors = [
      { name: 'io1', type: 'io', x: -3, y: 0, direction: 'left',  extends: 'tiny' },
      { name: 'io2', type: 'io', x:  3, y: 0, direction: 'right', extends: 'tiny' },
    ];

    fields = [
      {
        name: 'label',
        type: 'text',
        _label: 'Label',
        isTool: true,
      },
    ];
    
    update() {
      this.shape.children[1].text = this.label;
      this.tryUpdateShape(this.shape.children[1]);
    }

    updateStatus(options = {}) {
      this.setStatus(options.connector.received, options);
    }

    statusUpdated(options) {
      super.statusUpdated(options);
      this.updateForStatus();
      if (options.connector) {
        this.actdia.fireLabeledStatus?.(this.label, this.status, this);
      }
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