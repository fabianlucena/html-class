import { determinant } from '../../../matrix/matrix.js';

export default async function create({ actdia, Node, _, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class Determinant extends Node {
    static _label = _f('Determinant');

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
          text: '|M|',
          fontSize: 1,
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
      this.setStatus(this.determinant());
      super.updateStatus();
    }

    determinant() {
      const m = this.#input.status;
      if (!m && m !== 0) {
        return _('No matrix input');
      }

      try {
        return determinant(m);
      } catch (error) {
        return error.message;
      }
    }
  };
}