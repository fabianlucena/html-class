import Term from './term.js';

const input = document.createElement('input');
input.style.position = 'absolute';
input.style.left = '35em';
input.style.top = '2em';
input.style.opacity = 0;
input.style.zIndex = -1;
document.body.appendChild(input);

const keysTranslation = {
  'Enter': '\n',
  'Backspace': '\b',
  'Delete': '\x1b[3~',
  'Insert': '\x1b[2~',
  'Tab': '\t',
  'Shift': '',
  'Control': '',
  'Alt': '',
  'CapsLock': '',
  'Dead': '',
  'Escape': '\x1b',
  'ArrowUp': '\x1b[A',
  'ArrowDown': '\x1b[B',
  'ArrowRight': '\x1b[C',
  'ArrowLeft': '\x1b[D',
};

export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);

  return class Terminal extends Node {
    shape = {
      children: [
        {
          name: 'frame',
          shape: 'rect',
          rx: .1,
          ry: .1,
          width: 10,
          height: 3,
        },
        {
          name: 'viewport',
          x: .5,
          y: .5,
          children: [
            {
              shape: 'rect',
              name: 'background',
              shape: 'rect',
              rx: .2,
              ry: .2,
              fill: '#00000080',
              width: 9,
              height: 2,
            },
            {
              name: 'text',
              shape: 'text',
              text: '',
              lineSpacing: 1.0,
              fillOpacity: 1,
              textAnchor: 'left',
              dominantBaseline: 'top',
              width: 9,
              height: 2,
              space: 'preserve',
              fontFamily: 'Consolas, "Courier New", monospace',
            },
            {
              shape: 'path',
              className: 'blink',
              name: 'cursor',
              d: 'M 0 0 h 1',
              stroke: '#a1a1a1',
              fill: 'none',
              strokeWidth: .2,
            },
          ],
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 10,
      height: 3,
    };

    connectors = [
      { name: 'port', type: 'io', x: 0, y: 1, direction: 'left', onRecv: params => this.onPortRecv(params) },
    ];

    canChangeWidth = true;
    canChangeHeight = true;
    #portConnector = null;
    #keyDownHandler = evt => this.keyDownHandler(evt);
    #term = new Term();
    #backgroundShape = null;
    #viewportShape = null;
    #frameShape = null;
    #textShape = null;
    #cursorShape = null;
    #charWidth = 0;
    #charHeight = 0;

    get term() {
      return this.#term;
    }

    get rows() {
      return this.#term.rows;
    }

    set rows(value) {
      this.#term.rows = value;
    }

    get cols() {
      return this.#term.cols;
    }

    set cols(value) {
      this.#term.cols = value;
    }

    init() {
      super.init(...arguments);
      this.#portConnector = this.getConnector('port');
      this.#frameShape = this.getShape('frame');
      this.#viewportShape = this.getShape('viewport');
      this.#backgroundShape = this.getShape('background');
      this.#textShape = this.getShape('text');
      this.#cursorShape = this.getShape('cursor');
    }

    update() {
      const vWidth = this.box.width - 1;
      const vHeight = this.box.height - 1;
      
      if (this.#frameShape) {
        this.#frameShape.width = this.box.width;
        this.#frameShape.height = this.box.height;
      }
      
      if (this.#viewportShape) {
        this.#viewportShape.width = vWidth;
        this.#viewportShape.height = vHeight;
      }
      
      if (this.#backgroundShape) {
        this.#backgroundShape.width = vWidth;
        this.#backgroundShape.height = vHeight;
      }

      if (this.#textShape) {
        this.#textShape.width = vWidth;
        this.#textShape.height = vHeight;

        let svgText = this.#textShape?.svgElement;
        if (svgText) {
          if (this.autoSize) {
            const lines = this.text.split('\n');
            const lastLine = lines[lines.length - 1];
            const bbox = svgText.getBBox();

            this.box.width = bbox.width;
            this.box.height = bbox.height;
            if (lastLine.trim().length <= 0) {
              bbox.height++;
            }
          }

          this.actdia.updateItemSelectionBox(this);

          let tspan = svgText.children[0];
          if (!tspan?.getNumberOfChars()) {
            this.#textShape.text = ' ';
            this.tryUpdateShape(this.#textShape);
            tspan = svgText.children[0];
          }

          let width;
          if (tspan.getNumberOfChars() === 1) {
            width = tspan.getComputedTextLength();
          } else {
            width = tspan.getStartPositionOfChar(1).x
              - tspan.getStartPositionOfChar(0).x;
          }

          this.rows = Math.floor(vHeight);
          this.cols = Math.floor(vWidth / width);

          this.#charWidth = vWidth / this.cols;
          this.#charHeight = vHeight / this.rows;

          this.#cursorShape.d = `M 0 ${this.#charHeight} h ${this.#charWidth}`;
        }
      }

      this.tryUpdateShape(this.shape);

      super.update();
    }

    select() {
      super.select(...arguments);
      if (this.selected) {
        input.addEventListener('keydown', this.#keyDownHandler);
        input.focus();
      } else {
        input.removeEventListener('keydown', this.#keyDownHandler);
      }
    }

    keyDownHandler(evt) {
      let key = keysTranslation[evt.key] ?? evt.key;
      if (key === '')
        return;

      this.#portConnector.send(key, { force: true });
    }

    onPortRecv({ data }) {
      this.#term.receive(data);
      this.#textShape.text = this.term.viewport.map(l => l.map(c => c.char).join('')).join('\n');
      this.tryUpdateShape(this.#textShape);

      this.#cursorShape.x = this.term.cursor.col * this.#charWidth;
      this.#cursorShape.y = this.term.cursor.row * this.#charHeight;
      this.tryUpdateShape(this.#cursorShape);
    }
  };
}
