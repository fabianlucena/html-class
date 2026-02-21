import { getEventTypes } from './event_types.js';
import { getPath } from '../../utils/path.js';

const basePath = getPath(import.meta.url);

export default function create({ Node, _ }) {
  const eventTypes = getEventTypes(_, { forStart: true });

  return class StartEvent extends Node {
    static _label = 'Start Event';

    shape = {
      shapes: [
        {
          shape: 'circle',
          x: 2,
          y: 2,
          r: 2,
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
      { name: 'io', type: 'io', x: 4, y: 2, direction: 'right', extends: 'small', ortho: true },
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
        this.shape.shapes[1].href = basePath + '/event_types.svg#' + typeData.sprite;
        this.actdia.tryUpdateShape(this.shape.shapes[1]);
      }
    }
  };
}