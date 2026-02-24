export default function create({ Node }) {
  return class Led extends Node {
    rotateCenterX = -.5;

    shape = {
      children: [
        {
          shape: 'circle',
          r: .4,
          x: -.5,
        },
        {
          shape: 'circle',
          r: .4,
          x: -.5,
          fill: '#FF0000',
          opacity: 0.2,
        },
      ],
    };

    box = {
      x: -1,
      y: -.5,
      width: 1,
      height: 1,
    };

    connectors = [
      { name: 'i0', type: 'in', x: -1, y: 0, direction: 'left', extends: 'tiny' },
    ];

    fields = [
      {
        name: 'color',
        type: 'color',
        _label: 'Color',
      },
      {
        name: 'classicColor',
        type: 'select',
        _label: 'Classic Color',
        options: [
          { value: '#FF0000', label: 'Red', style: 'background-color: #FF0000' },
          { value: '#00FF00', label: 'Green', style: 'background-color: #00FF00' },
          { value: '#0000FF', label: 'Blue', style: 'background-color: #0000FF' },
          { value: '#FFFF00', label: 'Yellow', style: 'background-color: #FFFF00' },
          { value: '#FFBF00', label: 'Amber', style: 'background-color: #FFBF00' },
          { value: '#FFA500', label: 'Orange', style: 'background-color: #FFA500' },
          { value: '#FFFFFF', label: 'White', style: 'background-color: #FFFFFF' },
          { value: '#FFC0CB', label: 'Pink', style: 'background-color: #FFC0CB' },
          { value: '#800080', label: 'Purple', style: 'background-color: #800080' },
          { value: '#00FFFF', label: 'Cyan', style: 'background-color: #00FFFF' },
        ],
      },
    ];

    get color() {
      return this.shape.children[1].fill;
    }

    set color(value) {
      this.shape.children[1].fill = value;
      this.tryUpdateShape(this.shape.children[1]);
    }

    get classicColor() {
      return this.color;
    }
    
    set classicColor(value) {
      this.color = value;
    }

    updateStatus() {
      let status = this.connectors[0].status || 0;
      if (isNaN(status) || status <= 0) {
        status = 0;
      }

      if (status > 1 || status === true) {
        status = 1;
      }

      this.shape.children[1].opacity = status;
      this.tryUpdateShape(this.shape.children[1]);
    }
  };
}