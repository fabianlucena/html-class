import { _, _f, dateTimeSmallFormatNoSeconds, onLanguageLoaded } from '../locale/locale';
import { newId } from '../utils/id';
import getOptions from './options';

export default class Issue {
  static fields = [
    {
      field: 'id',
      label: 'ID',
      _label: _f('ID'),
      description: 'Unique identifier of the issue',
      _description: _f('Unique identifier of the issue'),
      defaultValue: 'N/A',
      _defaultValue: _('N/A'),
      type: 'id',
    },
    {
      field: 'title',
      _label: _f('Title'),
      _description: _f('Short summary of the issue'),
      _defaultValue: _f('Untitled issue'),
      type: 'text',
    },
    {
      field: 'description',
      _label: _f('Description'),
      _description: _f('Detailed information about the issue'),
      _defaultValue: _f('No description'),
      type: 'textarea',
    },
    {
      field: 'assignee',
      _label: _f('Assignee'),
      _description: _f('Person responsible for resolving the issue'),
      _defaultValue: _f('Unassigned'),
      type: 'select',
      options: getOptions('assignees'),
    },
    {
      field: 'createdAt',
      _label: _f('Created at'),
      _description: _f('Date and time when the issue was created'),
      _defaultValue: _f('Unknown date'),
      formater: dateTimeSmallFormatNoSeconds,
      type: 'datetime',
    },
    {
      field: 'status',
      _label: _f('Status'),
      _defaultValue: _f('No status'),
      _description: _f('Current state of the issue (e.g., open, in progress, closed)'),
      showAlways: false,
      type: 'select',
      options: getOptions('statuses'),
    },
    {
      field: 'priority',
      _label: _f('Priority'),
      _description: _f('Importance level of the issue'),
      _defaultValue: _f('No priority'),
      showAlways: false,
      type: 'select',
      options: getOptions('priorities'),
    },
    {
      field: 'reporter',
      _label: _f('Reporter'),
      _description: _f('Person who reported the issue'),
      _defaultValue: _f('Unknown'),
      showAlways: false,
      type: 'select',
      options: getOptions('reporters'),
    },
    {
      field: 'labels',
      _label: _f('Labels'),
      _description: _f('Labels associated with the issue'),
      _defaultValue: _f('No labels'),
      showAlways: false,
      type: 'tags',
    },
    {
      field: 'tags',
      _label: _f('Tags'),
      _description: _f('Tags associated with the issue'),
      _defaultValue: _f('No tags'),
      showAlways: false,
      type: 'tags',
    },
    {
      field: 'estimation',
      _label: _f('Estimation'),
      _description: _f('Estimated complexity used to calculate the expected duration and cost'),
      _defaultValue: _f('No estimation'),
      showAlways: false,
      type: 'number',
    },
    {
      field: 'scheduledStart',
      _label: _f('Scheduled start'),
      _description: _f('Planned start date and time for working on the issue'),
      _defaultValue: _f('No scheduled start'),
      formater: dateTimeSmallFormatNoSeconds,
      showAlways: false,
      type: 'datetime',
    },
    {
      field: 'estimatedDuration',
      _label: _f('Estimated duration'),
      _description: _f('Estimated time to resolve the issue (e.g., "3h", "2d")'),
      _defaultValue: _f('No estimated duration'),
      showAlways: false,
      type: 'duration',
    },
    {
      field: 'dueDate',
      _label: _f('Due date'),
      _description: _f('Deadline or expected completion date for the issue'),
      _defaultValue: _f('No due date'),
      formater: dateTimeSmallFormatNoSeconds,
      showAlways: false,
      type: 'datetime',
    },
    {
      field: 'actualStart',
      _label: _f('Actual start'),
      _description: _f('The date and time when work on the issue actually began'),
      _defaultValue: _f('Not started'),
      formater: dateTimeSmallFormatNoSeconds,
      showAlways: false,
      type: 'datetime',
    },
    {
      field: 'actualEnd',
      _label: _f('Actual end'),
      _description: _f('The date and time when work on the issue was completed'),
      _defaultValue: _f('Not completed'),
      formater: dateTimeSmallFormatNoSeconds,
      showAlways: false,
      type: 'datetime',
    },
    {
      _label: _f('Edit'),
      showAlways: true,
      type: 'button',
    },
  ];

  static updateTranslations() {
    Issue.fields.forEach(field => {
      if (field._label)
        field.label = _(field._label);

      if (field._description)
        field.description = _(field._description);

      if (field._defaultValue)
        field.defaultValue = _(field._defaultValue);
    });
  }

  constructor(options = {}) {
    Object.assign(this, options);

    this.id ||= newId();
    this.createdAt ||= new Date();
  }
}

onLanguageLoaded(Issue.updateTranslations);
