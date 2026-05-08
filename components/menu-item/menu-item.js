import { importCss } from '../utils/import-css.js';
import Base from '../utils/base.js';

importCss('./menu-item.css', import.meta.url);

export default class MenuItem extends Base {
  #element = null;
  #parent = null;
  #items = [];

  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    const { parent, element, display, show, hide, className,...rest } = options;

    this.#parent = parent;
    this.#element = element; 
    
    if (!this.#parent)
      this.#parent = document.body;
  
    if (!this.#element)
      this.#element = document.createElement('div');

    this.#parent.appendChild(this.#element);

    this.onMouseDown = this.handleMouseDown.bind(this);
    this.#element.addEventListener('mousedown', this.onMouseDown);

    this.addClass('menu-item', className);

    super.create(rest);

    if (show === false || hide)
      this.hide();

    if (typeof display !== 'undefined')
      this.display = display;
  }

  destroy() {
    for (const item of this.#items) {
      item.destroy();
    }

    this.#element.removeEventListener('mousedown', this.onMouseDown);
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

  set label(label) {
    this.#element.innerHTML = label;
  }

  set items(items) {
    for (const item of this.#items || []) {
      item.destroy();
    }
    this.#items = [];
    this.subMenu?.remove();
    this.subMenu = null;
    this.#element.classList.remove('has-submenu');
    this.addItem(...items);
  }

  addItem(...items) {
    if (!this.subMenu) {
      this.subMenu = document.createElement('div');
      this.subMenu.classList.add('submenu');
      this.#element.appendChild(this.subMenu);
      this.#element.classList.add('has-submenu');
    }

    for (const item of items) {
      this.#items.push(new MenuItem({
        parent: this.subMenu,
        ...item
      }));
    }
  }

  get hasSubmenu() {
    return this.#items.length > 0;
  }

  set display(value) {
    this.#element.style.display = value ? '' : 'none';
  }

  get display() {
    return this.#element.style.display !== 'none';
  }

  get showing() {
    return this.display;
  }

  hide() {
    this.display = false;
  }

  show() {
    this.display = true;
  }

  hide() {
    this.#element.style.display = 'none';
  }

  handleMouseDown(event) {
    if (this.action) {
      event.stopPropagation();
      event.preventDefault();

      this.action({
        menuItem: this,
        data: this.data,
        event,
      });
    }

    if (this.hasSubmenu) {
      event.stopPropagation();
      event.preventDefault();
      
      if (this.subMenu.style.display == 'block') {
        this.subMenu.style.display = 'none';
      } else {
        this.subMenu.style.display = 'block';
      }
    }
  }

  setPos(x, y) {
    this.#element.style.left = `${x}px`;
    this.#element.style.top = `${y}px`;
  }
}