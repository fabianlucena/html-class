export default function create({ Node }) {
  return class Viewer extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 12,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 12,
          height: 4,
          text: '',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 12,
      height: 4,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 2, direction: 'left', extends: 'small' },
    ];

    canChangeWidth = true;
    canChangeHeight = true;

    setWidth(value) {
      this.shape.children[0].width = value;
      this.shape.children[1].width = value;
      super.setWidth(value);
    }

    setHeight(value) {
      const dy = (value % 2) / 2;
      this.shape.y = dy;
      this.box.y = dy;

      this.shape.children[0].height = value;
      this.shape.children[1].height = value;
      this.connectors[0].y = value / 2 + dy;

      super.setHeight(value);
    }

    updateStatus() {
      let status = this.connectors[0].status;
      if (Array.isArray(status)) {
        status = status.map(v => v ? v : 0);
      }

      if (Array.isArray(status)) {
        this.shape.children[1].text = JSON.stringify(status);
      } else {
        this.shape.children[1].text = JSON.stringify(status, null, ' ');
      }

      this.tryUpdateShape(this.shape.children[1]);
    }
  };
}