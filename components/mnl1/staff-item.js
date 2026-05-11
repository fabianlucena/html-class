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
    this.#x = value;
    this.update();
  }

  set y(value) {
    this.#y = value;
    this.update();
  }

  get staffPitch() {
    return this.parent?.staffPitch ?? 0;
  }

  set staffPitch(value) {
    if (this.parent)
      this.parent.staffPitch = value;
  }

  get staffNoteReference() {
    return this.parent?.staffNoteReference;
  }

  set staffNoteReference(value) {
    if (this.parent)
      this.parent.staffNoteReference = value;
  }

  update() {
  }
}