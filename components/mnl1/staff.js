import ScoreItem from './score-item.js';
import StaffItem from './staff-item.js';

export default class Staff extends ScoreItem {
  #lineCount = 5;
  #lines = [];
  #width = null;
  #items = [];
  #cursor = { x: 0, y: 0 };
  #staffPitch = 2;
  #staffNoteReference = null;

  constructor(options) {
    super(options);

    this.marginTop = 5;
    this.marginLeft = 2;
    this.marginRight = 1;

    this.create(options);
  }

  get lineCount() {
    return this.#lineCount;
  }

  get width() {
    return this.#width;
  }

  createElement(options) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', 'staff');

    
    this.linesElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.linesElement.setAttribute('class', 'lines');
    this.element.appendChild(this.linesElement);
  }

  get cursor() {
    return this.#cursor;
  }

  get items() {
    return this.#items;
  }

  get staffPitch() {
    return this.#staffPitch;
  }

  set staffPitch(value) {
    this.#staffPitch = value;
  }

  get staffNoteReference() {
    return this.#staffNoteReference;
  }

  set staffNoteReference(value) {
    this.#staffNoteReference = value;
  }

  update() {
    let width = this.width ?? (this.parent ? this.parent.width - this.marginLeft - this.marginRight : 50);

    if (isNaN(width))
      width = 50;

    for (let i = 0, y = this.marginTop; i < this.lineCount; i++, y++) {
      const line = this.#lines[i] || document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.marginLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.marginLeft + width);
      line.setAttribute('y2', y);
      if (!this.#lines[i]) {
        this.#lines.push(line);
        this.linesElement.appendChild(line);
      }
    }

    while (this.#lines.length > this.lineCount) {
      this.#lines.pop().remove();
    }

    this.#staffPitch = this.lineCount / 2 - .5;
    this.cursor.x = this.marginLeft + 1;
    this.cursor.y = this.marginTop + this.lineCount - 1;

    for (const item of this.items) {
      item.x = this.cursor.x;
      item.y = this.cursor.y;
      item.update();
      this.cursor.x += item.width;
    }
  }

  addItem(item) {
    if (!(item instanceof StaffItem)) {
      throw new Error('Item must be an instance of StaffItem');
    }

    item.parent = this;
    this.#items.push(item);
    return item;
  }
}