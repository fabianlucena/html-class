export default async function create({ actdia, Node, _ }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class Range extends Node {
    shape = {
      children: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 6,
          height: 3,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 3,
          y: 1.5,
          text: 'y = f(x)',
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 6,
      height: 3,
    };

    connectors = [
      { name: 'input',          type: 'in',  x: 0, y: 1, direction: 'left',  extends: 'small' },
      { name: 'output',         type: 'out', x: 6, y: 1, direction: 'right', extends: 'small' },
      { name: 'compoundOutput', type: 'out', x: 6, y: 2, direction: 'right', extends: 'small' },
      { name: 'funOutput',      type: 'out', x: 1, y: 3, direction: 'bottom', extends: 'small' },
      { name: 'funInput',       type: 'in',  x: 5, y: 3, direction: 'bottom', extends: 'small' },
    ];

    #input = null;
    #output = null;
    #compoundOutput = null;
    #funOutput = null;
    #funInput = null;

    init() {
      super.init(...arguments);
      this.#input = this.getConnector('input');
      this.#output = this.getConnector('output');
      this.#compoundOutput = this.getConnector('compoundOutput');
      this.#funOutput = this.getConnector('funOutput');
      this.#funInput = this.getConnector('funInput');
    }

    #calculating = false;
    updateStatus({ connector, force } = {}) {
      if (false
        || !this.#funInput.connections.length
        || !this.#funOutput.connections.length
        || !this.#input.connections.length
        || this.#calculating && connector === this.#funInput && !force
      ) {
        return;
      }

      let domain = this.#input.status;
      if (!Array.isArray(domain)) {
        domain = [domain];
      }
      
      let pairs = [];
      try {
        this.#calculating = true;
        domain.forEach((v, i) => {
          this.#funOutput.setStatus(v);
          pairs.push([v, this.#funInput.status]);
        });
      } catch (error) {
        console.error(error);
      }

      this.#calculating = false;

      this.setStatus(pairs, { propagate: false });
      this.#output.setStatus(pairs.map(pair => pair[1]));
      this.#compoundOutput.setStatus(pairs);
    }
  };
}