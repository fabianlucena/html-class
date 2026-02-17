import { getGatewaysTypes } from './gateways_types.js';
import { getPath } from '../../utils/path.js';

const basePath = getPath(import.meta.url);

export default function create({ Node, _ }) {
  const gatewaysTypes = getGatewaysTypes(_, { forStart: true });

  return class Gateway extends Node {
    static _label = 'Gateway';

    shape = {
      shapes: [
        {
          shape: 'polygon',
          points: '2,0 4,2 2,4 0,2',
        },
        {
          shape: 'use',
          href: basePath + '/gateways_types.svg#bpmn-gateway-none',
          x: 0,
          y: 0,
          width: 4,
          height: 4,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 4,
      height: 4,
    };

    connectors = [
      { name: 'i',  type: 'in',  x: 0, y: 2, direction: 'left',  extends: 'small' },
      { name: 'o0', type: 'out', x: 4, y: 2, direction: 'right', extends: 'small' },
      { name: 'o1', type: 'out', x: 2, y: 4, direction: 'down',  extends: 'small' },
      { name: 'o2', type: 'out', x: 2, y: 0, direction: 'up',    extends: 'small' }
    ];

    fields = [
      {
        name: 'type',
        label: _('Type'),
        type: 'select',
        options: gatewaysTypes.map(({ name, label }) => ({ value: name, label })),
      },
    ];

    #type = 'none';

    get type() {
      return this.#type;
    }

    set type(value) {
      if (this.#type !== value) {
        const typeData = gatewaysTypes.find(t => t.name === value);
        if (!typeData)
          return;

        this.#type = value;
        this.shape.shapes[1].href = basePath + '/gateways_types.svg#' + typeData.sprite;
        this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
      }
    }
  };
}