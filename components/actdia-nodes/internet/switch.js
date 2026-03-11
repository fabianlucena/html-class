import { getNumber } from '../../utils/number.js';

const points = [
    [-.5, 1],
    [-1, 2],
    [-1, 3],
    [3, 3],
    [4, 1],
    [4, 0],
    [0, 0],
    [-.5, 1],
  ],
  segs = [];

for (let i = 0; i < points.length - 1; i++) {
  const [x1, y1] = points[i];
  const [x2, y2] = points[i + 1];
  const len = Math.hypot(x2 - x1, y2 - y1);
  segs.push({ x1, y1, x2, y2, len });
}

const totalPermeter = segs.reduce((sum, s) => sum + s.len, 0);

function getPortPosition(factor) {
  let d = factor * totalPermeter;

  for (const s of segs) {
    if (d <= s.len) {
      const k = d / s.len;
      return {
        x: s.x1 + (s.x2 - s.x1) * k,
        y: s.y1 + (s.y2 - s.y1) * k
      };
    }
    d -= s.len;
  }

  const last = points[points.length - 1];
  return { x: last[0], y: last[1] };
}

export default async function create({ actdia, Node, _f }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class InternetSwitch extends Node {
    static label = 'Switch';
    static description = 'Internet Switch Node';
    static import = [
      './connector-utp-port.js',
    ];

    shape = {
      fill: '#1b6ac5ff',
      stroke: '#8db3dfff',
      children: [
        {
          skewX: -18.5,
          sy: .6666666,
          children: [
            {
              shape: 'rect',
              x: 0,
              y: 0,
              width: 4,
              height: 3,
            },
            {
              fill: '#ffffffff',
              stroke: '#00000000',
              children: [
                {
                  shape: 'polygon',
                  points: '2.2,0.5 3.3,0.5 3.3,0.25 3.8,0.75 3.3,1.25 3.3,1 2.2,1',
                },
                {
                  shape: 'polygon',
                  points: '1.8,1.5 0.7,1.5 0.7,1.75 0.2,1.25 0.7,0.75 0.7,1 1.8,1',
                },
                {
                  shape: 'polygon',
                  points: '2.2,1.5 3.3,1.5 3.3,1.25 3.8,1.75 3.3,2.25 3.3,2 2.2,2',
                },
                {
                  shape: 'polygon',
                  points: '1.8,2.5 0.7,2.5 0.7,2.75 0.2,2.25 0.7,1.75 0.7,2 1.8,2',
                },
              ],
            },
          ],
        },
        {
          shape: 'rect',
          x: -1,
          y: 2,
          width: 4,
          height: 1,
        },
        {
          shape: 'path',
          x: 3,
          y: 2,
          d: 'M 0 0 l 1 -2 l 0 1 l -1 2 Z',
        },
      ],
    };

    connectors = [
      { name: 'p00', type: 'utpPort', x: 0, y: 0, direction: 'left',  extends: 'tiny' },
      { name: 'p01', type: 'utpPort', x: 4, y: 1, direction: 'right', extends: 'tiny' },
    ];

    box = {
      x: -1,
      y: 0,
      width: 5,
      height: 3,
    };

    fields = [
      {
        name: 'portCount',
        _label: _f('Ports'),
        type: 'number',
        defaultValue: 8,
        min: 1,
        max: 24,
        isTool: true,
      },
    ];

    #portCount = 8;

    get portCount() {
      return this.#portCount;
    }

    set portCount(value) {
      this.setPortCount();
    }

    setPortCount(value, update = true) {
      value = getNumber(value, 8);
      if (value < 2) {
        value = 2;
      }

      if (value === this.#portCount) {
        return;
      }

      this.#portCount = value;
      this.updatePorts(update);
    }

    getNewConnector(connector) {
      return super.getNewConnector(
        {
          index: this.inputsCount,
          type: 'utpPort',
          name: `p${String(this.inputsCount).padStart(2, '0')}`,
        },
        ...arguments,
      );
    }

    init() {
      super.init(...arguments);
      this.updatePorts(false);
    }

    update() {
      if (this.isInitializing)
        return;

      const portCount = this.#portCount;
      const ports = this.connectors.filter(c => c.type === 'utpPort');
      for (let i = 0; i < ports.length; i++) {
        const port = ports[i];
        const pos = getPortPosition(i / portCount);
        port.x = pos.x;
        port.y = pos.y;
      }

      super.update(...arguments);
    }

    updatePorts(update = true) {
      const portCount = this.#portCount;
      const currentPortCount = this.connectors.length;
      let needUpdate = false;
      if (portCount > currentPortCount) {
        needUpdate = true;
        for (let i = currentPortCount; i < portCount; i++) {
          this.addConnector(false);
        }
      } else if (portCount < currentPortCount) {
        needUpdate = true;
        for (let i = portCount; i < currentPortCount; i++) {
          this.removeLasConnectorByType('utpPort', false);
        }
      }

      if (needUpdate && update) {
        this.update();
      }
    }
  };
}