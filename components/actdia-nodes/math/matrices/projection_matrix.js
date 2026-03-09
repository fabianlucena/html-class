import { orthographic, perspective } from '../../../matrix/projection.js';

export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);
  
  return class Matrix extends SquareMatrix {
    static _label = _f('Projection matrix');

    connectors = [
      { name: 'fov',    type: 'in',  x: 1, y: 3, direction: 'bottom', extends: 'tiny', onUpdate: ({status}) => this.setFov(status) },
      { name: 'aspect', type: 'in',  x: 2, y: 3, direction: 'bottom', extends: 'tiny', onUpdate: ({status}) => this.setAspect(status) },
      { name: 'near',   type: 'in',  x: 3, y: 3, direction: 'bottom', extends: 'tiny', onUpdate: ({status}) => this.setNear(status) },
      { name: 'far',    type: 'in',  x: 4, y: 3, direction: 'bottom', extends: 'tiny', onUpdate: ({status}) => this.setFar(status) },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right',  extends: 'tiny' },
    ];

    fields = [
      {
        name: 'fov',
        type: 'number',
        _label: _f('Field of view'),
        set: value => this.setFov(value),
        isTool: true,
      },
      {
        name: 'aspect',
        type: 'number',
        _label: _f('Aspect ratio'),
        set: value => this.setAspect(value),
        isTool: true,
      },
      {
        name: 'near',
        type: 'number',
        _label: _f('Near plane'),
        set: value => this.setNear(value),
        isTool: true,
      },
      {
        name: 'far',
        type: 'number',
        _label: _f('Far plane'),
        set: value => this.setFar(value),
        isTool: true,
      },
      {
        name: 'type',
        type: 'select',
        _label: _f('Type'),
        options: [
          { value: 'orthographic', _label: _f('Orthographic') },
          { value: 'perspective', _label: _f('Perspective') },
        ],
        isTool: true,
      },
    ];

    saveStatus = true;
    fov = 45;
    aspect = 1.7777777777777777;
    near = 0.1;
    far = 100;
    type = 'perspective';
    #output = null;
    #fovConnector = null;
    #aspectConnector = null;
    #nearConnector = null;
    #farConnector = null;
    
    init() {
      super.init({ size: 4 }, ...arguments);
      this.#output = this.getConnector('output');
      this.#fovConnector = this.getConnector('fov');
      this.#aspectConnector = this.getConnector('aspect');
      this.#nearConnector = this.getConnector('near');
      this.#farConnector = this.getConnector('far');
    }

    setFov(value, update = true) {
      this.fov = value;
      update && this.updateStatus();
    }

    setAspect(value, update = true) {
      this.aspect = value;
      update && this.updateStatus();
    }

    setNear(value, update = true) {
      this.near = value;
      update && this.updateStatus();
    }

    setFar(value, update = true) {
      this.far = value;
      update && this.updateStatus();
    }

    update() {
      if (this.isInitializing)
        return;

      this.#fovConnector.x = 1;
      this.#fovConnector.y = this.box.height + this.box.y;
      this.#aspectConnector.x = 2;
      this.#aspectConnector.y = this.box.height + this.box.y;
      this.#nearConnector.x = 3;
      this.#nearConnector.y = this.box.height + this.box.y;
      this.#farConnector.x = 4;
      this.#farConnector.y = this.box.height + this.box.y;
      this.#output.x = this.box.width + this.box.x;
      this.#output.y = this.box.height / 2 + this.box.y;
      this.tryUpdateConnector(this.#fovConnector);
      this.tryUpdateConnector(this.#aspectConnector);
      this.tryUpdateConnector(this.#nearConnector);
      this.tryUpdateConnector(this.#farConnector);
      this.tryUpdateConnector(this.#output);
      
      super.update();
      this.updateStatus();
    }

    updateStatus() {
      const { fov, aspect, near, far, type } = this;
      console.log({ fov, aspect, near, far, type });
      let matrix;
      if (type === 'orthographic') {
        matrix = orthographic(fov, aspect, near, far);
      } else {
        matrix = perspective(fov, aspect, near, far);
      }

      this.setStatus(matrix);
      super.updateStatus();
    }
  };
}