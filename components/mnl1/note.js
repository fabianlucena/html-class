import StaffItem from './staff-item.js';

const symbols = [
  {
    id: 'quarter-note',
    viewBox: '-0.05 -.56 1.4 1.2',
    path: 'M 1.26 -0.3237 C 1.1881 -0.4563 1.0363 -0.5281 0.8519 -0.5281 C 0.7163 -0.5281 0.5681 -0.4881 0.4238 -0.4119 C 0.16 -0.2719 0 -0.0362 0 0.1681 C 0 0.2238 0.0119 0.28 0.04 0.3319 C 0.1119 0.4638 0.2637 0.5319 0.4481 0.5319 C 0.5838 0.5319 0.7319 0.4963 0.8763 0.42 C 1.14 0.28 1.3 0.0438 1.3 -0.16 C 1.3 -0.2162 1.2881 -0.2719 1.26 -0.3237',
    offset: { x: 0, y: -0.505 },
    width: 1.4,
    height: 1.1,
  },
  {
    id: 'half-note',
    viewBox: '-0.05 -.56 1.4 1.2',
    path: 'M 1.26 -0.3256 C 1.1881 -0.4575 1.0363 -0.5294 0.8519 -0.5294 C 0.7163 -0.5294 0.5681 -0.4894 0.4238 -0.4138 C 0.16 -0.2737 0 -0.0375 0 0.1663 C 0 0.2225 0.0119 0.2787 0.04 0.3306 C 0.1119 0.4631 0.2637 0.5313 0.4481 0.5313 C 0.5838 0.5313 0.7319 0.495 0.8763 0.4194 C 1.14 0.2787 1.3 0.0425 1.3 -0.1619 C 1.3 -0.2175 1.2881 -0.2737 1.26 -0.3256 M 1.0881 -0.0537 C 1.02 0.0144 0.8838 0.0981 0.74 0.1787 C 0.5963 0.2587 0.4519 0.3188 0.3563 0.3387 C 0.3362 0.3431 0.3163 0.3469 0.2963 0.3469 C 0.2319 0.3469 0.1837 0.3231 0.1563 0.2706 C 0.1438 0.2506 0.1363 0.2269 0.1363 0.2025 C 0.1363 0.1588 0.1638 0.1062 0.2081 0.0625 C 0.2762 -0.0056 0.4081 -0.0894 0.5519 -0.1694 C 0.6963 -0.2494 0.84 -0.3094 0.9363 -0.3294 C 0.9563 -0.3337 0.9763 -0.3375 0.9963 -0.3375 C 1.06 -0.3375 1.1119 -0.3138 1.14 -0.2619 C 1.1519 -0.2419 1.1563 -0.2175 1.1563 -0.1938 C 1.1563 -0.1494 1.1319 -0.1019 1.0881 -0.0537',
    offset: { x: 0, y: -0.505 },
    width: 1.4,
    height: 1.1,
  },
];

const values = {
  'q': {
    use: 'quarter-note',
  },
  'h': {
    use: 'half-note',
  },
};

export default class Note extends StaffItem {
  #pitch;
  #value = 'q';
  #symbol = symbols.find(s => s.id === values[this.#value]?.use);

  constructor(options) {
    if (typeof options === 'string') {
      if (options.length === 1) {
        options = { note: options };
      } else {
        options = { note: options[1], value: options[0] };
      }
    }

    super(options);
    this.create(options);
  }
  
  createElement(options) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    this.element.setAttribute('class', 'note');
  }

  setParent(parent) {
    super.setParent(parent);
    if (this.#symbol)
      this.addSymbolIfNotExists(this.#symbol);
  }

  set note(value) {
    this.pitch = (value.charCodeAt(0) - 'a'.charCodeAt(0)) / 2;
  }

  set value(newValue) {
    this.#value = newValue;
    const symbolInfo = values[this.#value];
    this.#symbol = symbols.find(s => s.id === symbolInfo.use);
    this.addSymbolIfNotExists(this.#symbol);
  }

  set pitch(value) {
    this.#pitch = value;
    this.update();
  }

  update() {
    if (!this.parent)
      return;

    this.element.setAttribute('href', `#${this.#symbol.id}`);
    this.element.setAttribute('x', this.x + this.#symbol.offset.x);
    this.element.setAttribute('y', this.y + this.#symbol.offset.y - this.#pitch - this.staffPitch);
    this.element.setAttribute('width', this.#symbol.width);
    this.element.setAttribute('height', this.#symbol.height);

    this.staffNoteReference = this;
    this.width = this.#symbol.width;
  }
}