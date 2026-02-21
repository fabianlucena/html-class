import { add } from '../../matrix/matrix.js';

export default function create({ Node, _, _f }) {
  return class MatrixAddition extends Node {
    static _label = _f('Matrix addition');

    shape = {
      children: [
        {
          shape: 'rect',
          y: .5,
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          y: 1.5,
          shape: 'text',
          text: '+',
          fontSize: 1.5,
        },
      ],
    };

    box = {
      y: .5,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'i1', type: 'in', x: 0, y: 2, direction: 'left', extends: 'tiny' },
      { name: 'o', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    updateStatus() {
      this.setStatus(this.add());
      super.updateStatus();
    }

    add() {
      const v0 = this.inputs[0]?.status;
      if (!v0 && v0 !== 0) {
        return _('No matrix input');
      }

      const v1 = this.inputs[1]?.status;
      if (!v1 && v1 !== 0) {
        return _('No matrix input');
      }

      try {
        return add(v0, v1);
      } catch (error) {
        return error.message;
      }
    }
  };
}