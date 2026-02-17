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
      label: _('Event-Based (Exclusive)'),
      sprite: 'bpmn-gateway-event-based',
    },
    {
      name: 'event-parallel',
      label: _('Event-Based (Parallel)'),
      sprite: 'bpmn-gateway-event-parallel',
    },
  ];
}