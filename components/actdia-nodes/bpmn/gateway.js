import { getGatewaysTypes } from './gateways_types.js';
import { getPath } from '../../utils/path.js';

const basePath = getPath(import.meta.url);

export default function create({ Node, _ }) {
  const gatewaysTypes = getGatewaysTypes(_, { forStart: true });

  return class Gateway extends Node {
    static _label = 'Gateway';

    shape = {
      children: [
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
      { name: 'io0', type: 'io', x: 0, y: 2, direction: 'left',  extends: 'small', ortho: true },
      { name: 'io1', type: 'io', x: 4, y: 2, direction: 'right', extends: 'small', ortho: true },
      { name: 'io2', type: 'io', x: 2, y: 4, direction: 'down',  extends: 'small', ortho: true },
      { name: 'io3', type: 'io', x: 2, y: 0, direction: 'up',    extends: 'small', ortho: true }
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
        this.shape.children[1].href = basePath + '/gateways_types.svg#' + typeData.sprite;
        this.actdia.tryUpdateShape(this.shape.children[1]);
      }
    }
  };
}