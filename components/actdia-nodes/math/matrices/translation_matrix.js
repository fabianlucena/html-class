export default async function create({ actdia, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);

  return class TranslationMatrix extends SquareMatrix {
    static _label = _f('Translation matrix');

    fields = [
      {
        name: 'translation.x',
        type: 'number',
        _label: _f('X'),
        set: (value) => this.setTranslation({ x: value }),
        isTool: true,
      },
      {
        name: 'translation.y',
        type: 'number',
        _label: _f('Y'),
        set: (value) => this.setTranslation({ y: value }),
        isTool: true,
      },
      {
        name: 'translation.z',
        type: 'number',
        _label: _f('Z'),
        set: (value) => this.setTranslation({ z: value }),
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
    ];

    editable = false;
    #output = null;
    #xConnector = null;
    #yConnector = null;
    #zConnector = null;
    #translation = { x: 0, y: 0, z: 0 };
    #type = '2d';

    connectors = [
      { name: 'x', type: 'in',  x: 1, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({data}) => this.setTranslation({ x: data }) },
      { name: 'y', type: 'in',  x: 2, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({data}) => this.setTranslation({ y: data }) },
      { name: 'z', type: 'in',  x: 3, y: 3, direction: 'bottom',  extends: 'tiny', onUpdate: ({data}) => this.setTranslation({ z: data }) },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    get translation() {
      return this.#translation;
    }

    set translation(value) {
      this.setTranslation(value);
    }

    get type() {
      return this.#type;
    }

    set type(value) {
      this.setType(value);
    }

    init() {
      super.init(...arguments);
      this.#xConnector = this.getConnector('x');
      this.#yConnector = this.getConnector('y');
      this.#zConnector = this.getConnector('z');
      this.#output = this.getConnector('output');
    }

    setTranslation(value, update = true) {
      if ( (typeof value.x === 'undefined' || this.#translation.x === value.x)
        && (typeof value.y === 'undefined' || this.#translation.y === value.y)
        && (typeof value.z === 'undefined' || this.#translation.z === value.z)
      ) {
        return;
      }

      this.#translation = { ...this.#translation, ...value };
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
        this.size = 3;
        newStatus = [
          [1, 0, 0],
          [0, 1, 0],
          [this.#translation.x, this.#translation.y, 1],
        ];
      } else if (this.#type === '3d') {
        this.size = 4;
        newStatus = [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [this.#translation.x, this.#translation.y, this.#translation.z, 1],
        ];
      } else {
        throw new Error('Unknown type for matrix translation');
      }

      this.setStatus(newStatus);
      super.updateStatus();
    }
  };
}