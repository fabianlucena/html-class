import { loadLocaleForMeta } from '../../../locale/locale.js';

loadLocaleForMeta(import.meta);

export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);

  return class RotationMatrix extends SquareMatrix {
    static _label = _f('Rotation matrix');

    fields = [
      {
        name: 'angle',
        type: 'number',
        step: .01,
        _label: _f('Angle'),
        isTool: true,
      },
      {
        name: 'type',
        type: 'select',
        options: [
          { value: '2d', _label: _f('2D') },
          { value: 'x',  _label: _f('X-axis') },
          { value: 'y',  _label: _f('Y-axis') },
          { value: 'z',  _label: _f('Z-axis') },
        ],
        isTool: true,
      },
      {
        name: 'augmented',
        type: 'checkbox',
        _label: _f('Augmented'),
        isTool: true,
      },
    ];

    editable = false;
    #output = null;
    #input = null;
    #angle = 0;
    #type = '2d';
    #augmented = false;

    connectors = [
      { name: 'input',  type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    get angle() {
      return this.#angle;
    }

    set angle(value) {
      this.setAngle(value);
    }

    get type() {
      return this.#type;
    }

    set type(value) {
      this.setType(value);
    }

    get augmented() {
      return this.#augmented;
    }

    set augmented(value) {
      this.setAugmented(value);
    }

    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#output = this.getConnector('output');
    }

    setAngle(value, update = true) {
      this.#angle = value;
      if (update) {
        this.updateStatus();
      }
    }

    setType(value, update = true) {
      this.#type = value;
      if (update) {
        this.update();
      }
    }

    setAugmented(value, update = true) {
      this.#augmented = value;
      if (update) {
        this.update();
      }
    }

    update() {
      if (this.isInitializing)
        return;
      
      super.update();
      this.#input.x = this.box.x;
      this.#input.y = this.box.height / 2 + this.box.y;
      this.#output.x = this.box.width + this.box.x;
      this.#output.y = this.box.height / 2 + this.box.y;
      this.tryUpdateConnector(this.#input);
      this.tryUpdateConnector(this.#output);
      this.updateStatus();
    }

    updateStatus() {
      let newStatus;
      if (this.#type === '2d') {
        if (this.#augmented) {
          this.size = 3;
          newStatus = [[], [], []];
        } else {
          this.size = 2;
          newStatus = [[], []];
        }
      } else {
        if (this.#augmented) {
          this.size = 4;
          newStatus = [[], [], [], []];
        } else {
          this.size = 3;
          newStatus = [[], [], []];
        }
      }

      const angleScale = this.actdia?.properties.angleScale || 1;
      this.#angle = this.#input?.status ?? 0;
      let ca = Math.cos(this.#angle * angleScale);
      let sa = Math.sin(this.#angle * angleScale);
      if (this.#type === '2d') {
        newStatus[0][0] =  ca;
        newStatus[0][1] = -sa;
        newStatus[1][0] =  sa;
        newStatus[1][1] =  ca;
        if (this.#augmented) {
          newStatus[0][2] = 0;
          newStatus[1][2] = 0;
          newStatus[2][0] = 0;
          newStatus[2][1] = 0;
          newStatus[2][2] = 1;
        }
      } else {
        if (this.#type === 'x') {
          newStatus[0][0] =  1;
          newStatus[0][1] =  0;
          newStatus[0][2] =  0;
          newStatus[1][0] =  0;
          newStatus[1][1] =  ca;
          newStatus[1][2] = -sa;
          newStatus[2][0] =  0;
          newStatus[2][1] =  sa;
          newStatus[2][2] =  ca;
        } else if (this.#type === 'y') {
          newStatus[0][0] =  ca;
          newStatus[0][1] =  0;
          newStatus[0][2] =  sa;
          newStatus[1][0] =  0;
          newStatus[1][1] =  1;
          newStatus[1][2] =  0;
          newStatus[2][0] = -sa;
          newStatus[2][1] =  0;
          newStatus[2][2] =  ca;
        } else if (this.#type === 'z') {
          newStatus[0][0] =  ca;
          newStatus[0][1] = -sa;
          newStatus[0][2] =  0;
          newStatus[1][0] =  sa;
          newStatus[1][1] =  ca;
          newStatus[1][2] =  0;
          newStatus[2][0] =  0;
          newStatus[2][1] =  0;
          newStatus[2][2] =  1;
        } else {
          throw new Error('Unknown type for matrix rotation');
        }

        if (this.#augmented) {
          newStatus[0][3] = 0;
          newStatus[1][3] = 0;
          newStatus[2][3] = 0;
          newStatus[3][0] = 0;
          newStatus[3][1] = 0;
          newStatus[3][2] = 0;
          newStatus[3][3] = 1;
        }
      }

      this.setStatus(newStatus);
      super.updateStatus();
    }
  };
}