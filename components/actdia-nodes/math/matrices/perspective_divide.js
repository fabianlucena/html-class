export default async function create({ actdia, Node, _, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class PerspectiveDivide extends Node {
    static _label = _f('Perspective divide');

    shape = {
      children: [
        {
          shape: 'rect',
          y: .5,
          width: 2,
          height: 2,
          rx: .2,
          ry: .2,
        },
        {
          y: 1.5,
          shape: 'text',
          text: '÷w',
          fontSize: 1,
        },
      ],
    };

    box = {
      x: 0,
      y: .5,
      width: 2,
      height: 2,
    };

    connectors = [
      { name: 'i', type: 'in', x: 0, y: 1, direction: 'left', extends: 'tiny' },
      { name: 'o', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    updateStatus() {
      this.setStatus(this.perspectiveDivide());
      super.updateStatus();
    }

    perspectiveDivide() {
      const data = this.inputs[0]?.received;
      if (!Array.isArray(data)) {
        return _('No vector input');
      }

      if (Array.isArray(data[0])) {
        return data.map(v => [v[0] / v[3], v[1] / v[3]]);
      }

      return [data[0] / data[3], data[1] / data[3]];
    }
  };
}