import { pluDecomposition } from '../../../matrix/matrix.js';

export default async function create({ actdia, Node, _, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class PLU extends Node {
    static _label = _f('PLU Decomposition');

    shape = {
      y: .5,
      children: [
        {
          shape: 'rect',
          width: 3,
          height: 3,
          rx: .2,
          ry: .2,
        },
        {
          x: 1.5,
          y: 1.5,
          shape: 'text',
          text: 'PLU',
          fontSize: 1,
        },
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 3,
      height: 3,
    };

    connectors = [
      { name: 'input', type: 'in',  x: 0, y: 2,   direction: 'left',  extends: 'tiny' },
      { name: 'p',     type: 'out', x: 3, y: 1,   direction: 'right', extends: 'tiny' },
      { name: 'l',     type: 'out', x: 3, y: 2,   direction: 'right', extends: 'tiny' },
      { name: 'u',     type: 'out', x: 3, y: 3,   direction: 'right', extends: 'tiny' },
      { name: 'swaps', type: 'out', x: 1, y: 3.5, direction: 'down',  extends: 'tiny' },
      { name: 'sign',  type: 'out', x: 2, y: 3.5, direction: 'down',  extends: 'tiny' },
    ];

    #input = null;
    #p = null;
    #l = null;
    #u = null;
    #swaps = null;
    #sign = null;

    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#p = this.getConnector('p');
      this.#l = this.getConnector('l');
      this.#u = this.getConnector('u');
      this.#swaps = this.getConnector('swaps');
      this.#sign = this.getConnector('sign');
    }

    updateStatus() {
      this.setStatus(this.pluDecomposition());
      super.updateStatus();
    }

    pluDecomposition() {
      const m = this.#input.received;
      if (!m && m !== 0) {
        return _('No matrix input');
      }

      try {
        return pluDecomposition(m);
      } catch (error) {
        return error.message;
      }
    }

    propagate(options = {}) {
      this.#l?.setStatus?.(this.status.l, options);
      this.#u?.setStatus?.(this.status.u, options);
      this.#p?.setStatus?.(this.status.p, options);
      this.#swaps?.setStatus?.(this.status.swaps, options);
      this.#sign?.setStatus?.(this.status.sign, options);
    }
  };
}