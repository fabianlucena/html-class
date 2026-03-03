import { isMatrix } from '../../../matrix/matrix.js';

export default async function create({ actdia, _f }) {
  const { MatrixBase } = await actdia.importElementClass(import.meta.url.replace('matrix_viewer.js', 'matrix_base.js'));
  
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
      this.status = this.#input.status;
      let dimension = isMatrix(this.status);
      if (dimension) {
        this.dimension = dimension;
      }

      super.updateStatus();
    }
  };
}