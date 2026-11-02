export default class Base {
  #element = null;

  constructor(options = {}) {
  }

  get element() {
    return this.#element;
  }

  set element(newElement) {
    if (newElement && typeof newElement === 'string')
      newElement = document.getElementById(newElement);

    var parentElement = this.parentElement;
    if (this.element !== newElement)
      this.destroyElement();

    if (!newElement)
      return;

    this.#element = newElement;
    if (parentElement)
      parentElement.appendChild(this.#element);
  }

  get parentElement() {
    return this.#element?.parentNode;
  }

  set parentElement(newParentElement) {
    if (typeof newParentElement === 'string')
      newParentElement = document.getElementById(newParentElement);

    if (newParentElement === this.parentElement)
      return;
    
   if (this.#element) {
      this.#element?.remove();
      if (!newParentElement)
        return;

      if (!newParentElement.contains(this.#element))
        newParentElement.appendChild(this.#element);
    }
  }

  create(options = {}) {
    if (typeof options === 'string')
      options = { element: options };

    let { parentElement, element, show, hide, display, className, defaultParentElement, ...rest } = options;

    if (typeof element === 'string')
      element = document.getElementById(element);

    this.element = element;
    this.parentElement = parentElement ?? defaultParentElement;

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
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
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