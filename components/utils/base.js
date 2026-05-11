export default class Base {
  #element = null;
  #parent = null;
  #parentElement = null;

  constructor(options = {}) {
  }

  get parentElement() {
    return this.#parentElement;
  }

  set parentElement(value) {
    if (typeof value === 'string')
      value = document.getElementById(value);

    this.#parentElement = value;
  }

  create(options = {}) {
    let { parent, parentElement, element, show, hide, display, className,...rest } = options;

    this.parent = parent;
    if (parentElement)
      this.parentElement = parentElement;
    this.element = element;

    this.addClass(className);

    for (let [key, value] of Object.entries(rest)) {
      const setter = `set${key[0].toUpperCase() + key.slice(1)}`;
      if (this[setter]) {
        this[setter](value);
        continue;
      }

      this[key] = value; 
    }

    if (show === false || hide)
      this.hide();

    if (typeof display !== 'undefined')
      this.display = display;
  }

  destroy() {
    this.element = null;
  }

  set parent(newParent) {
    if (!newParent) {
      this.#parent = null;
      this.#parentElement = null;
      this.#element?.remove();
      return;
    }

    if (typeof newParent === 'string')
      newParent = document.getElementById(newParent);

    if (newParent instanceof HTMLElement) {
      this.#parent = null;
      this.parentElement = newParent;
      return;
    }

    this.#parent = newParent;
    if (this.#parent.#element instanceof HTMLElement)
      this.parentElement = this.#parent.#element;
  }

  set parentElement(newParentElement) {
    if (!newParentElement) {
      this.#parent = null;
      this.#parentElement = null;
      this.#element?.remove();
      return;
    }

    if (typeof newParentElement === 'string')
      this.#parentElement = document.getElementById(newParentElement);

    this.#parentElement = newParentElement;
    if (this.#element)
      this.#parentElement.appendChild(this.#element);
  }

  set element(newElement) {
    if (!newElement) {
      this.destroyElement();
      return;
    }

    if (typeof newElement === 'string')
      newElement = document.getElementById(newElement);

    this.#element = newElement;
    if (this.#parentElement)
      this.#parentElement.appendChild(this.#element);
  }

  get element() {
    return this.#element;
  }

  destroyElement() {
    if (!this.#element)
      return;

    this.#element.remove();
    this.#element = null;
  }

  addClass(...classNames) {
    for (const className of classNames) {
      if (!className)
        return;

      if (Array.isArray(className))
        this.#element.classList.add(...className);
      else if (className instanceof Set)
        this.#element.classList.add(...className);
      else if (typeof className === 'string')
        this.#element.classList.add(...className.trim().split(/\s+/).filter((c) => c));
      else if (typeof className === 'object') {
        for (const key of className) {
          let value = className[key];
          if (!value)
            continue;

          if (typeof value === 'function')
            value = value();

          if (value)
            this.#element.classList.add(key);
        }
      }
    }
  }

  set display(value) {
    this.#element.style.display = value ? '' : 'none';
  }

  get display() {
    return this.#element.style.display !== 'none';
  }
  
  hide() {
    this.display = false;
  }

  show() {
    this.display = true;
  }
}