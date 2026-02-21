export default function create({ Node }) {
  return class JsonData extends Node {
    static _label = 'JSON Data';
    
    autoPropagate = true;

    shape = {
      shapes: [
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
      { name: 'o0', type: 'out', x: 12, y: 2, direction: 'right', extends: 'small' },
    ];

    data = '';

    fields = [
      {
        name: 'data',
        type: 'textarea',
        _label: 'JSON Data',
      },
    ];

    update() {
      this.setStatus(this.data ? JSON.parse(this.data) : null);

      this.shape.shapes[1].text = this.data;
      this.actdia.tryUpdateShape(this.shape.shapes[1]);

      super.update();
    }
  };
}