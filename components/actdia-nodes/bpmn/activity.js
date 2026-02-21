import { getActivitiesTypes } from './activities_types.js';
import { getPath } from '../../utils/path.js';

const basePath = getPath(import.meta.url);

export default function create({ Node, _ }) {
  const activitiesTypes = getActivitiesTypes(_, { forStart: true });

  return class Activity extends Node {
    static _label = 'Activity';

    shape = {
      children: [
        {
          shape: 'rect',
          width: 8,
          height: 4,
          rx: .5,
          ry: .5,
        },
        {
          shape: 'use',
          href: basePath + '/activities_types.svg#bpmn-task-none',
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
      width: 8,
      height: 4,
    };

    connectors = [
      { name: 'i',  type: 'in',  x: 0, y: 2, direction: 'left',  extends: 'small' },
      { name: 'o0', type: 'out', x: 8, y: 2, direction: 'right', extends: 'small' },
      { name: 'o1', type: 'out', x: 4, y: 4, direction: 'down',  extends: 'small' },
      { name: 'o2', type: 'out', x: 4, y: 0, direction: 'up',    extends: 'small' }
    ];

    fields = [
      {
        name: 'type',
        label: _('Type'),
        type: 'select',
        options: activitiesTypes.map(({ name, label }) => ({ value: name, label })),
      },
    ];

    #type = 'none';

    get type() {
      return this.#type;
    }

    set type(value) {
      if (this.#type !== value) {
        const typeData = activitiesTypes.find(t => t.name === value);
        if (!typeData)
          return;

        this.#type = value;
        this.shape.children[1].href = basePath + '/activities_types.svg#' + typeData.sprite;
        this.actdia.tryUpdateShape(this.shape.children[1]);
      }
    }
  };
}