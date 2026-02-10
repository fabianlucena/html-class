export default class Base {
  #element = null;
  #parent = null;

  constructor(options = {}) {
  }

  get element() {
    return this.#element;
  }

  set element(value) {
    if (typeof value === 'string')
      value = document.getElementById(value);

    this.#element = value;
  }

  get parent() {
    return this.#parent;
  }

  set parent(value) {
    if (typeof value === 'string')
      value = document.getElementById(value);

    this.#parent = value;
  }

  create(options = {}) {
    for (let [key, value] of Object.entries(options)) {
      const setter = `set#${key[0].toUpperCase() + key.slice(1)}`;
      if (this[setter]) {
        this[setter](value);
        continue;
      }

      this[key] = value; 
    }
  }
}