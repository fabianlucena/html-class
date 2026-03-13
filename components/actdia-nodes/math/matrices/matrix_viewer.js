import { isMatrix } from '../../../matrix/matrix.js';

export default async function create({ actdia, _, _f }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { MatrixBase } = await actdia.importElementClassForMeta('matrix_base.js', import.meta);
  
  return class MatrixViewer extends MatrixBase {
    static _label = _f('Matrix viewer');

    connectors = [
      { name: 'input', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
    ];

    #input = null;
    
    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
    }

    update() {
      super.update();
      if (this.#input) {
        this.#input.x = this.box.x;
        this.#input.y = this.box.height / 2 - this.box.y;
        this.tryUpdateConnector(this.#input);
      }
    }

    updateStatus() {
      this.status = this.#input.received;
      let dimension = isMatrix(this.status);
      if (dimension) {
        this.dimension = dimension;
      }

      super.updateStatus();
    }
  };
}