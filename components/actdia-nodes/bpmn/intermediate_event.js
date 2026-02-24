import { getEventTypes } from './event_types.js';
import { getPath } from '../../utils/path.js';

const basePath = getPath(import.meta.url);

export default function create({ Node, _ }) {
  const eventTypes = getEventTypes(_, { forIntermediate: true });

  return class IntermediateEvent extends Node {
    static _label = 'Intermediate Event';
    
    shape = {
      children: [
        {
          shape: 'circle',
          x: 2,
          y: 2,
          r: 2,
        },
        {
          shape: 'circle',
          x: 2,
          y: 2,
          r: 1.7,
        },
        {
          shape: 'use',
          href: basePath + '/event_types.svg#bpmn-none',
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
      { name: 'i', type: 'in',  x: 0, y: 2, direction: 'left',  extends: 'small' },
      { name: 'o', type: 'out', x: 4, y: 2, direction: 'right', extends: 'small' },
    ];

    fields = [
      {
        name: 'type',
        label: _('Type'),
        type: 'select',
        options: eventTypes.map(({ name, label }) => ({ value: name, label })),
      },
    ];

    #type = 'none';

    get type() {
      return this.#type;
    }

    set type(value) {
      if (this.#type !== value) {
        const typeData = eventTypes.find(t => t.name === value);
        if (!typeData)
          return;

        this.#type = value;
        this.shape.children[2].href = basePath + '/event_types.svg#' + typeData.sprite;
        this.tryUpdateShape(this.shape.children[2]);
      }
    }
  };
}