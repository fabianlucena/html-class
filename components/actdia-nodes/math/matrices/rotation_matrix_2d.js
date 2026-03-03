export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClass(import.meta.url.replace('rotation_matrix_2d.js', 'square_matrix.js'));

  return class RotationMatrix2D extends SquareMatrix {
    static _label = _f('Rotation matrix 2D');

    fields = [
      {
        name: 'angle',
        type: 'number',
        step: .01,
        _label: _f('Angle (degrees)'),
        isTool: true,
      },
    ];

    size = 2;
    editable = false;
    #output = null;
    #input = null;
    #angle = 0;

    connectors = [
      { name: 'input',  type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    get angle() {
      return this.#angle;
    }

    set angle(value) {
      this.#angle = value;
      this.updateStatus();
    }
    
    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#output = this.getConnector('output');
    }

    update() {
      if (this.isInitializing)
        return;
      
      super.update();
      this.#input.x = this.box.x;
      this.#input.y = this.box.height / 2 - this.box.y;
      this.#output.x = this.box.width - this.box.x;
      this.#output.y = this.box.height / 2 - this.box.y;
      this.tryUpdateConnector(this.#output);
    }

    updateStatus() {
      this.#angle = this.#input?.status ?? 0;
      if (this.status) {
        let ca = Math.cos(this.#angle * Math.PI / 180);
        let sa = Math.sin(this.#angle * Math.PI / 180);
        this.status[0][0] =  ca;
        this.status[0][1] = -sa;
        this.status[1][0] =  sa;
        this.status[1][1] =  ca;
      }

      super.updateStatus();
    }
  };
}