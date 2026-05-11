import Mnl1Item from './mnl1-item.js';
import Staff from './staff.js';

export default class Score extends Mnl1Item {
  #scaleX = 24;
  #scaleY = 24;
  #items = [];

  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('transform', `scale(${this.#scaleX}, ${this.#scaleY})`);
    this.element.setAttribute('class', 'score');

    super.create(options);
  }

  get width() {
    return this.parent.element.viewBox.baseVal.width / this.#scaleX;
  }

  addStaff(staff) {
    if (!staff) {
      staff = new Staff();
    } else if (!(staff instanceof ScoreItem)) {
      throw new Error('Staff must be an instance of ScoreItem');
    }

    staff.parent = this;
    this.#items.push(staff);
    return staff; 
  }

  update() {
    for (const item of this.#items) {
      item.update();
    }
  }
}