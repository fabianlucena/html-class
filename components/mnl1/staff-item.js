import Mnl1Item from './mnl1-item.js';

export default class StaffItem extends Mnl1Item {
  #x = 0;
  #y = 0;

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  set x(value) {
    if (isNaN(value)) {
      console.warn('Invalid x value:', value);
      console.trace();
      return;
    }

    this.#x = value;
    this.update();
  }

  set y(value) {
    if (isNaN(value)) {
      console.warn('Invalid y value:', value);
      console.trace();
      return;
    }

    this.#y = value;
    this.update();
  }

  get staffLineCount() {
    return this.parent?.staffLineCount ?? 0;
  }

  get staffPitch() {
    return this.parent?.staffPitch ?? 0;
  }

  set staffPitch(value) {
    if (this.parent)
      this.parent.staffPitch = value;
  }

  get staffLastPitch() {
    return this.parent?.staffLastPitch;
  }

  set staffLastPitch(value) {
    if (this.parent)
      this.parent.staffLastPitch = value;
  }

  get firstStaffLine() {
    return this.parent?.firstStaffLine ?? 0;
  }

  get lastStaffLine() {
    return this.parent?.lastStaffLine ?? 0;
  }

  update() {
  }
}