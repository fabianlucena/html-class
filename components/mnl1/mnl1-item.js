export default class Mnl1Item {
  #parent;
  #element;
  #marginTop;
  #marginRight;
  #marginBottom;
  #marginLeft;

  get parent() {
    return this.#parent;
  }

  set parent(parent) {
    this.setParent(parent);
  }

  setParent(parent) {
    if (!parent) {
      if (this.#element) {
        this.#element.remove();
      }

      this.#parent = null;
    } else {
      this.#parent = parent;
      if (this.#element) {
        this.#parent.element.appendChild(this.#element);
      }
    }

    this.update();
  }

  set element(element) {
    if (this.#element) {
      this.#element.remove();
      if (!element) {
        this.#element = null;
        return;
      }
    }

    this.#element = element;
    if (this.#parent) {
      this.#parent.element.appendChild(this.#element);
    }
  }

  get element() {
    return this.#element;
  }

  set marginTop(margin) {
    this.#marginTop = margin;
  }

  get marginTop() {
    return this.#marginTop;
  }

  set marginRight(margin) {
    this.#marginRight = margin;
  }

  get marginRight() {
    return this.#marginRight;
  }

  set marginBottom(margin) {
    this.#marginBottom = margin;
  }

  get marginBottom() {
    return this.#marginBottom;
  }

  set marginLeft(margin) {
    this.#marginLeft = margin;
  }

  get marginLeft() {
    return this.#marginLeft;
  }

  createElement(options) {
  }

  create(options) {
    this.createElement(options);

    if (options) {
      Object.assign(this, options);
    }

    this.update();
  }

  update() {
  }

  addSymbol(...symbols) {
    return this.parent?.addSymbol?.(...symbols);
  }

  addSymbolIfNotExists(...symbols) {
    return this.parent?.addSymbolIfNotExists?.(...symbols);
  }
}