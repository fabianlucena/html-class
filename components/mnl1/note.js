import StaffItem from './staff-item.js';

const symbols = [
  {
    id: 'whole-rest',
    viewBox: '0 0 1.3 .53',
    path: 'M 1.2444 -0.02 L 0.0563 -0.02 C 0.0238 -0.02 0 0.0037 0 0.0362 L 0 0.4681 C 0 0.5 0.0238 0.5238 0.0563 0.5238 L 1.2444 0.5238 C 1.2763 0.5238 1.3 0.5 1.3 0.4681 L 1.3 0.0362 C 1.3 0.0037 1.2763 -0.02 1.2444 -0.02',
    offset: { x: 0, y: -1.03 },
    width: 1.3,
    height: .53,
  },
  {
    id: 'half-note',
    viewBox: '-0.05 -.56 1.4 1.2',
    path: 'M 1.26 -0.3256 C 1.1881 -0.4575 1.0363 -0.5294 0.8519 -0.5294 C 0.7163 -0.5294 0.5681 -0.4894 0.4238 -0.4138 C 0.16 -0.2737 0 -0.0375 0 0.1663 C 0 0.2225 0.0119 0.2787 0.04 0.3306 C 0.1119 0.4631 0.2637 0.5313 0.4481 0.5313 C 0.5838 0.5313 0.7319 0.495 0.8763 0.4194 C 1.14 0.2787 1.3 0.0425 1.3 -0.1619 C 1.3 -0.2175 1.2881 -0.2737 1.26 -0.3256 M 1.0881 -0.0537 C 1.02 0.0144 0.8838 0.0981 0.74 0.1787 C 0.5963 0.2587 0.4519 0.3188 0.3563 0.3387 C 0.3362 0.3431 0.3163 0.3469 0.2963 0.3469 C 0.2319 0.3469 0.1837 0.3231 0.1563 0.2706 C 0.1438 0.2506 0.1363 0.2269 0.1363 0.2025 C 0.1363 0.1588 0.1638 0.1062 0.2081 0.0625 C 0.2762 -0.0056 0.4081 -0.0894 0.5519 -0.1694 C 0.6963 -0.2494 0.84 -0.3094 0.9363 -0.3294 C 0.9563 -0.3337 0.9763 -0.3375 0.9963 -0.3375 C 1.06 -0.3375 1.1119 -0.3138 1.14 -0.2619 C 1.1519 -0.2419 1.1563 -0.2175 1.1563 -0.1938 C 1.1563 -0.1494 1.1319 -0.1019 1.0881 -0.0537',
    offset: { x: 0, y: -0.505 },
    width: 1.4,
    height: 1.1,
  },
  {
    id: 'half-rest',
    viewBox: '0 -.53 1.3 .53',
    path: 'M 0 -0.4719 L 0 -0.04 C 0 0.0163 0 0.0163 0.0563 0.0163 L 1.2444 0.0163 C 1.3 0.0163 1.3 0.0163 1.3 -0.04 L 1.3 -0.4719 C 1.3 -0.5281 1.3 -0.5281 1.2444 -0.5281 L 0.0563 -0.5281 C 0 -0.5281 0 -0.5281 0 -0.4719',
    offset: { x: 0, y: -0.53 },
    width: 1.3,
    height: .53,
  },
  {
    id: 'quarter-note',
    viewBox: '-0.05 -.56 1.4 1.2',
    path: 'M 1.26 -0.3237 C 1.1881 -0.4563 1.0363 -0.5281 0.8519 -0.5281 C 0.7163 -0.5281 0.5681 -0.4881 0.4238 -0.4119 C 0.16 -0.2719 0 -0.0362 0 0.1681 C 0 0.2238 0.0119 0.28 0.04 0.3319 C 0.1119 0.4638 0.2637 0.5319 0.4481 0.5319 C 0.5838 0.5319 0.7319 0.4963 0.8763 0.42 C 1.14 0.28 1.3 0.0438 1.3 -0.16 C 1.3 -0.2162 1.2881 -0.2719 1.26 -0.3237',
    offset: { x: 0, y: -0.505 },
    width: 1.4,
    height: 1.1,
  },
  {
    id: 'quarter-rest',
    viewBox: '-0.05 -1.6 .93 2.92',
    path: 'M 0.9281 0.6763 L 0.92 0.6638 C 0.9163 0.66 0.9081 0.6519 0.8963 0.6363 L 0.4363 0.0681 C 0.4238 0.0563 0.4281 0.0238 0.4363 0.0081 L 0.8438 -0.6081 C 0.8481 -0.6163 0.8519 -0.6281 0.8519 -0.6363 L 0.8519 -0.6719 C 0.8519 -0.6838 0.8481 -0.6963 0.84 -0.7038 L 0.1919 -1.58 C 0.1919 -1.58 0.16 -1.6281 0.12 -1.5919 C 0.08 -1.56 0.1119 -1.5081 0.1119 -1.5081 L 0.4163 -1.0919 C 0.4319 -1.0681 0.4319 -1.02 0.4163 -0.9963 L 0.0119 -0.38 C 0.0081 -0.3719 0.0037 -0.3563 0.0037 -0.3481 L 0.0037 -0.3119 C 0.0037 -0.3 0.0081 -0.2881 0.0163 -0.28 L 0.4638 0.2762 C 0.4481 0.2719 0.4119 0.2637 0.3638 0.2637 C 0.2963 0.2637 0.2081 0.28 0.1363 0.3438 C 0.0481 0.4238 0 0.5363 0 0.6363 C 0 0.6919 0.0119 0.7481 0.0438 0.7919 C 0.1281 0.92 0.4281 1.3 0.4281 1.3 C 0.4281 1.3 0.4638 1.3444 0.5 1.3163 C 0.5363 1.2881 0.5281 1.2519 0.5163 1.2319 C 0.5038 1.2119 0.3763 0.98 0.3763 0.98 C 0.3763 0.98 0.3481 0.9238 0.3481 0.8519 C 0.3481 0.8 0.3638 0.7363 0.4163 0.6838 C 0.4638 0.6363 0.52 0.62 0.5719 0.62 C 0.6238 0.62 0.6681 0.6363 0.7 0.6563 L 0.8563 0.7563 C 0.8563 0.7563 0.9038 0.78 0.9281 0.7438 C 0.9481 0.7119 0.94 0.6963 0.9281 0.6763',
    offset: { x: 0, y: -1.6 },
    width: .93,
    height: 2.92,
  },
  {
    id: 'eighth-rest',
    viewBox: '-.01 -0.83 1.13 1.86',
    path: 'M 1.0694 -0.8106 C 1.0394 -0.8219 1.0125 -0.8081 0.9994 -0.7838 C 0.9863 -0.7594 0.8588 -0.5225 0.6819 -0.3919 C 0.6263 -0.3513 0.5625 -0.3256 0.5 -0.3125 C 0.545 -0.3625 0.5719 -0.4294 0.5719 -0.5019 C 0.5719 -0.66 0.4438 -0.7881 0.2863 -0.7881 C 0.1281 -0.7881 0 -0.66 0 -0.5019 C 0 -0.3819 0.075 -0.2781 0.1806 -0.2363 C 0.2419 -0.2075 0.3181 -0.1894 0.4 -0.1894 C 0.5138 -0.1894 0.6381 -0.2225 0.7469 -0.3025 C 0.7975 -0.3394 0.845 -0.3875 0.8881 -0.4375 L 0.4325 0.9875 L 0.5381 1.0219 L 1.1013 -0.7419 C 1.1106 -0.7713 1.0988 -0.7988 1.0694 -0.8106',
    offset: { x: 0, y: -0.83 },
    width: 1.14,
    height: 1.86,
  },
  {
    id: 'sixteenth-rest',
    viewBox: '-.01 -0.43 1.38 2.03',
    path: 'M 1.3388 -0.8106 C 1.3088 -0.8213 1.2819 -0.8069 1.2694 -0.7819 C 1.2575 -0.7575 1.1444 -0.54 0.9719 -0.4038 C 0.9181 -0.3613 0.8556 -0.3337 0.7931 -0.3181 C 0.8363 -0.3706 0.8613 -0.4375 0.8588 -0.51 C 0.8531 -0.6675 0.7213 -0.7906 0.5638 -0.785 C 0.4063 -0.7794 0.2825 -0.6475 0.2881 -0.49 C 0.2925 -0.3694 0.3706 -0.2694 0.4775 -0.2313 C 0.54 -0.2038 0.6163 -0.1894 0.6981 -0.1919 C 0.8119 -0.1963 0.935 -0.2338 1.0406 -0.3169 C 1.09 -0.3556 1.1363 -0.405 1.1775 -0.4569 L 1.1775 -0.4563 L 0.9975 0.18 C 0.9975 0.18 0.9975 0.1806 0.9969 0.1806 L 0.9969 0.1812 C 0.9781 0.2194 0.8481 0.4663 0.6875 0.5931 C 0.6338 0.6363 0.5713 0.6638 0.5088 0.6788 C 0.5519 0.6269 0.5769 0.56 0.5744 0.4875 C 0.5688 0.3294 0.4369 0.2063 0.2794 0.2119 C 0.1219 0.2175 -0.0019 0.3494 0.0037 0.5075 C 0.0081 0.6275 0.0863 0.7275 0.1931 0.7663 C 0.2556 0.7931 0.3319 0.8081 0.4138 0.805 C 0.5275 0.8013 0.6506 0.7638 0.7563 0.6806 C 0.805 0.6419 0.8513 0.5931 0.8925 0.5406 L 0.4844 1.9994 L 0.5913 2.0294 L 1.3381 -0.6188 L 1.3731 -0.7438 C 1.3813 -0.7731 1.3688 -0.8006 1.3388 -0.8106',
    offset: { x: 0, y: -0.83 },
    width: 1.39,
    height: 2.86,
  },
  {
    id: 'thirty-second-rest',
    viewBox: '-.01 -1.8 1.576 3.83',
    path: 'M 1.525 -1.835 C 1.4944 -1.8438 1.4688 -1.8288 1.4569 -1.8038 C 1.445 -1.7788 1.3481 -1.5844 1.1806 -1.4425 C 1.1275 -1.3975 1.0669 -1.3681 1.005 -1.3506 C 1.0463 -1.4038 1.0688 -1.4719 1.0638 -1.5438 C 1.0531 -1.7013 0.9163 -1.8194 0.7594 -1.8088 C 0.6019 -1.7981 0.4838 -1.6619 0.4944 -1.5038 C 0.5025 -1.3838 0.5844 -1.2869 0.6925 -1.2519 C 0.7556 -1.2275 0.8325 -1.215 0.9144 -1.2206 C 1.0281 -1.2288 1.1494 -1.2706 1.2519 -1.3575 C 1.2994 -1.3975 1.3438 -1.4488 1.3831 -1.5019 L 1.2263 -0.8581 C 1.205 -0.8038 1.0844 -0.5456 0.9294 -0.4144 C 0.8763 -0.3694 0.8156 -0.34 0.7538 -0.3225 C 0.795 -0.3756 0.8175 -0.4438 0.8125 -0.5163 C 0.8019 -0.6731 0.665 -0.7919 0.5081 -0.7806 C 0.3506 -0.77 0.2325 -0.6338 0.2431 -0.4763 C 0.2519 -0.3563 0.3331 -0.2587 0.4413 -0.2238 C 0.5044 -0.1994 0.5819 -0.1875 0.6631 -0.1931 C 0.7769 -0.2006 0.8981 -0.2425 1.0006 -0.3294 C 1.0481 -0.3694 1.0919 -0.42 1.1319 -0.4731 L 0.9838 0.1306 C 0.9675 0.1681 0.8425 0.445 0.6863 0.5775 C 0.6331 0.6225 0.5725 0.6519 0.5106 0.6694 C 0.5519 0.6163 0.5738 0.5488 0.5694 0.4763 C 0.5581 0.3188 0.4219 0.2006 0.265 0.2112 C 0.1075 0.2219 -0.0106 0.3588 0 0.5163 C 0.0081 0.6363 0.09 0.7331 0.1981 0.7681 C 0.2612 0.7931 0.3381 0.805 0.42 0.7994 C 0.5338 0.7913 0.655 0.7494 0.7575 0.6625 C 0.805 0.6219 0.8494 0.5719 0.8888 0.5188 L 0.525 2.0031 L 0.6325 2.03 L 1.5613 -1.7694 C 1.5688 -1.7988 1.555 -1.8256 1.525 -1.835',
    offset: { x: 0, y: -1.83 },
    width: 1.56,
    height: 3.83,
  },
];

const values = {
  w: {
    note: 'whole-note',
    rest: 'whole-rest',
  },
  h: {
    note: 'half-note',
    rest: 'half-rest',
  },
  q: {
    note: 'quarter-note',
    rest: 'quarter-rest',
  },
  e: {
    note: 'quarter-note',
    rest: 'eighth-rest',
  },
  s: {
    note: 'quarter-note',
    rest: 'sixteenth-rest',
  },
  t: {
    note: 'quarter-note',
    rest: 'thirty-second-rest',
  },
  i: {
    note: 'quarter-note',
    rest: 'sixty-fourth-rest',
  },
};

export default class Note extends StaffItem {
  #pitch;
  #octave;
  #value = 'q';
  #symbol;
  #ledgerLinesElement;
  #rest = false;

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

  set octave(value) {
    this.#octave = value;
    this.pitch += (value - 4) * 3.5;
    this.update();
  }

  get octave() {
    return this.#octave;
  }

  get note() {
    return String.fromCharCode(Math.round(this.pitch * 2 % 8) + 'a'.charCodeAt(0));
  }

  set value(newValue) {
    this.#value = newValue;
    this.updateSymbol();
  }

  get rest() {
    return this.#rest;
  }

  set rest(value) {
    this.#rest = value;
    this.updateSymbol();
  }

  set pitch(value) {
    this.#pitch = value;
    this.updateSymbol();
  }

  get pitch() {
    return this.#pitch;
  }

  updateSymbol() {
    const symbolInfo = values[this.#value][this.#rest ? 'rest' : 'note'];
    this.#symbol = symbols.find(s => s.id === symbolInfo);
    this.addSymbolIfNotExists(this.#symbol);
    this.update();
  }

  update() {
    if (!this.parent || (this.#pitch === undefined && !this.#rest) || !this.#symbol)
      return;

    const x = this.x;
    let y = this.y;
    if (!this.rest) {
      if (this.#octave === undefined) {
        const staffLastPitch = this.staffLastPitch;
        if (staffLastPitch) {
          let diff = this.pitch - staffLastPitch;
          let bias = 0;
          while (diff <= -1.5) {
            bias += 3.5;
            diff += 3.5;
          }

          while (diff >= 2) {
            bias -= 3.5;
            diff -= 3.5;
          }

          this.#pitch += bias;
        }
      }
      
      y -= this.#pitch + this.staffPitch;
      let llFrom, llTo;
      if (y < this.lastStaffLine) {
        llFrom = Math.ceil(y);
        llTo = this.lastStaffLine;
      } else if (y > this.firstStaffLine) {
        llFrom = this.firstStaffLine + 1;
        llTo = Math.ceil(y + .5);
      }

      if (llFrom < llTo) {
        if (!this.#ledgerLinesElement) {
          this.#ledgerLinesElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          this.#ledgerLinesElement.setAttribute('class', 'ledger-lines');
          this.parent.element.appendChild(this.#ledgerLinesElement);
        } else {
          while (this.#ledgerLinesElement.firstChild) {
            this.#ledgerLinesElement.removeChild(this.#ledgerLinesElement.firstChild);
          }
        }

        const xi = x - .2,
          xf = x + this.#symbol.width + .2;
        for (let i = llFrom; i < llTo; i++) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', xi);
          line.setAttribute('y1', i);
          line.setAttribute('x2', xf);
          line.setAttribute('y2', i);
          this.#ledgerLinesElement.appendChild(line);
        }
      } else if (this.#ledgerLinesElement) {
        this.parent.element.removeChild(this.#ledgerLinesElement);
        this.#ledgerLinesElement = null;
      }

      this.element.setAttribute('class', 'note');
      this.element.removeAttribute('rest');
      this.element.setAttribute('note', this.note + this.octave);
    } else {
      y += -Math.floor(this.staffLineCount / 2);
      this.element.setAttribute('class', 'rest');
      this.element.removeAttribute('note');
      this.element.setAttribute('rest', this.#value);
    }
    
    this.element.setAttribute('value', this.#symbol.id);
    this.element.setAttribute('href', `#${this.#symbol.id}`);
    this.element.setAttribute('x', x + this.#symbol.offset.x);
    this.element.setAttribute('y', y + this.#symbol.offset.y);
    this.element.setAttribute('width', this.#symbol.width);
    this.element.setAttribute('height', this.#symbol.height);

    this.staffLastPitch = this.#pitch;
    this.width = this.#symbol.width;
  }
}