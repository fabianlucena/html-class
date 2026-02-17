export function getActivitiesTypes(_) {
  return [
    {
      name: 'none',
      label: _('None'),
      sprite: 'bpmn-task-none',
    },
    {
      name: 'user',
      label: _('User task'),
      sprite: 'bpmn-task-user',
    },
    {
      name: 'manual',
      label: _('Manual task'),
      sprite: 'bpmn-task-manual',
    },
    {
      name: 'service',
      label: _('Service task'),
      sprite: 'bpmn-task-service',
    },
    {
      name: 'script',
      label: _('Script task'),
      sprite: 'bpmn-task-script',
    },
    {
      name: 'rule',
      label: _('Business rule task'),
      sprite: 'bpmn-task-rule',
    },
    {
      name: 'send',
      label: _('Send task'),
      sprite: 'bpmn-task-send',
    },
    {
      name: 'receive',
      label: _('Receive task'),
      sprite: 'bpmn-task-receive',
    },
    {
      name: 'call',
      label: _('Call activity'),
      sprite: 'bpmn-call-activity',
    },
    {
      name: 'subprocess-collapsed',
      label: _('Collapsed subprocess'),
      sprite: 'bpmn-subprocess-collapsed',
    },
    {
      name: 'subprocess-expanded',
      label: _('Expanded subprocess'),
      sprite: 'bpmn-subprocess-expanded',
    },
    {
      name: 'loop',
      label: _('Loop'),
      sprite: 'bpmn-loop',
    },
    {
      name: 'multi-instance-parallel',
      label: _('Multi-instance (parallel)'),
      sprite: 'bpmn-mi-parallel',
    },
    {
      name: 'multi-instance-sequential',
      label: _('Multi-instance (sequential)'),
      sprite: 'bpmn-mi-sequential',
    },
  ];
}