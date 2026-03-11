export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);

  return class ScaleMatrix extends SquareMatrix {
    static _label = _f('Scale matrix');

    fields = [
      {
        name: 'scale.x',
        type: 'number',
        _label: _f('X'),
        set: (value) => this.setScale({ x: value }),
        isTool: true,
      },
      {
        name: 'scale.y',
        type: 'number',
        _label: _f('Y'),
        set: (value) => this.setScale({ y: value }),
        isTool: true,
      },
      {
        name: 'scale.z',
        type: 'number',
        _label: _f('Z'),
        set: (value) => this.setScale({ z: value }),
        isTool: true,
      },
      {
        name: 'type',
        type: 'select',
        _label: _f('Type'),
        options: [
          { value: '2d', _label: _f('2D') },
          { value: '3d', _label: _f('3D') },
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
    #xConnector = null;
    #yConnector = null;
    #zConnector = null;
    #scale = { x: 1, y: 1, z: 1 };
    #type = '2d';
    #augmented = false;

    connectors = [
      { name: 'x', type: 'in',  x: 1, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({status}) => this.setScale({ x: status }) },
      { name: 'y', type: 'in',  x: 2, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({status}) => this.setScale({ y: status }) },
      { name: 'z', type: 'in',  x: 3, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({status}) => this.setScale({ z: status }) },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    get scale() {
      return this.#scale;
    }

    set scale(value) {
      this.setScale(value);
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
      this.#xConnector = this.getConnector('x');
      this.#yConnector = this.getConnector('y');
      this.#zConnector = this.getConnector('z');
      this.#output = this.getConnector('output');
    }

    setScale(value, update = true) {
      if ( (typeof value.x === 'undefined' || this.#scale.x === value.x)
        && (typeof value.y === 'undefined' || this.#scale.y === value.y)
        && (typeof value.z === 'undefined' || this.#scale.z === value.z)
      ) {
        return;
      }

      this.#scale = { ...this.#scale, ...value };
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
      if (this.#augmented === !!value) {
        return;
      }

      this.#augmented = value;
      if (update) {
        this.updateStatus();
      }
    }

    update() {
      if (this.isInitializing)
        return;
      
      super.update(); 
      this.#xConnector.x = 1;
      this.#xConnector.y = this.box.height + this.box.y;
      this.#yConnector.x = 2;
      this.#yConnector.y = this.box.height + this.box.y;
      this.#zConnector.x = 3;
      this.#zConnector.y = this.box.height + this.box.y;
      this.#output.x = this.box.width + this.box.x;
      this.#output.y = this.box.height / 2 + this.box.y;
      this.tryUpdateConnector(this.#xConnector);
      this.tryUpdateConnector(this.#yConnector);
      this.tryUpdateConnector(this.#zConnector);
      this.tryUpdateConnector(this.#output);
      this.updateStatus();
    }

    updateStatus() {
      if (!this.boxShape)
        return;

      let newStatus;
      if (this.#type === '2d') {
        const x = this.#scale.x;
        const y = this.#scale.y;
        if (this.#augmented) {
          this.size = 3;
          newStatus = [
            [x, 0, 0],
            [0, y, 0],
            [0, 0, 1],
          ];
        } else {
          this.size = 2;
          newStatus = [
            [x, 0],
            [0, y],
          ];
        }
      } else if (this.#type === '3d') {
        const x = this.#scale.x;
        const y = this.#scale.y;
        const z = this.#scale.z;
        if (this.#augmented) {
          this.size = 4;
          newStatus = [
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1],
          ];
        } else {
          this.size = 3;
          newStatus = [
            [x, 0, 0],
            [0, y, 0],
            [0, 0, z],
          ];
        }
      } else {
        throw new Error('Unknown type for matrix scale');
      }

      this.setStatus(newStatus);
      super.updateStatus();
    }
  };
}