export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);

  return class RotationMatrix extends SquareMatrix {
    static _label = _f('Rotation matrix');

    fields = [
      {
        name: 'angle',
        type: 'number',
        step: .01,
        _label: _f('Angle (degrees)'),
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

    setAugmented(value, update = true) {
      this.#augmented = value;
      if (update) {
        this.updateStatus();
      }
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
      this.updateStatus();
    }

    updateStatus() {
      let newStatus;
      if (this.#augmented) {
        this.size = 3;
        newStatus = [[],[], []];
      } else {
        this.size = 2;
        newStatus = [[],[]];
      }

      const angleScale = this.actdia.properties.angleScale;
      this.#angle = this.#input?.status ?? 0;
      let ca = Math.cos(this.#angle * angleScale);
      let sa = Math.sin(this.#angle * angleScale);
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

      this.setStatus(newStatus);
      super.updateStatus();
    }
  };
}