import { transposeMatrix } from '../../../matrix/matrix.js';

export default function create({ Node, _, _f }) {
  return class TransposeMatrix extends Node {
    static _label = _f('Transpose matrix');

    shape = {
      children: [
        {
          shape: 'rect',
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          y: 1,
          shape: 'text',
          text: 'T',
          fontSize: 1.5,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'input',  type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'tiny' },
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    #input = null;
    #output = null;

    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#output = this.getConnector('output');
    }

    updateStatus() {
      this.setStatus(this.transposeMatrix());
      super.updateStatus();
    }

    transposeMatrix() {
      const m = this.#input.status;
      if (!m && m !== 0) {
        return _('No matrix input');
      }

      try {
        return transposeMatrix(m);
      } catch (error) {
        return error.message;
      }
    }
  };
}