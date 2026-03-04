export default function create({ Node, _ }) {
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

    updateStatus({ connector }) {
      if (connector === this.#funInput)
        return;

      let domain = this.#input.status;
      if (!Array.isArray(domain)) {
        const pairs = [domain];
        this.#funOutput.setStatus(domain);
        pairs.push(this.#funInput.status);
        this.setStatus(pairs, { propagate: false });
        this.#output.setStatus(pairs[0]);
        this.#compoundOutput.setStatus(pairs);
        return;
      }
      
      let pairs = [];
      domain.forEach((v, i) => {
        this.#funOutput.setStatus(v);
        pairs.push([v, this.#funInput.status]);
      });

      this.setStatus(pairs, { propagate: false });
      this.#output.setStatus(pairs.map(pair => pair[1]));
      this.#compoundOutput.setStatus(pairs);
    }
  };
}