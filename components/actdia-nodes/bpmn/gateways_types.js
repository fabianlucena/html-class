export function getGatewaysTypes(_) {
  return [
    {
      name: 'none',
      label: _('None'),
      sprite: 'bpmn-gateway-none',
    },
    {
      name: 'exclusive',
      label: _('Exclusive (XOR)'),
      sprite: 'bpmn-gateway-xor',
    },
    {
      name: 'parallel',
      label: _('Parallel (AND)'),
      sprite: 'bpmn-gateway-parallel',
    },
    {
      name: 'inclusive',
      label: _('Inclusive (OR)'),
      sprite: 'bpmn-gateway-inclusive',
    },
    {
      name: 'complex',
      label: _('Complex'),
      sprite: 'bpmn-gateway-complex',
    },
    {
      name: 'event-based',
      label: _('Event-based (exclusive)'),
      sprite: 'bpmn-gateway-event-based',
    },
    {
      name: 'event-parallel',
      label: _('Event-based (parallel)'),
      sprite: 'bpmn-gateway-event-parallel',
    },
  ];
}