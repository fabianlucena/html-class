import { importCss } from '../utils/import-css.js';
import Base from '../utils/base.js';

importCss('./menu-item.css', import.meta.url);

export default class MenuItem extends Base {
  #element = null;
  #parent = null;
  #parentElement = null;
  #labelElement = null;
  #subMenuElement = null;
  #items = [];

  wrapAround = true;

  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    const { parent, parentElement, element, display, show, hide, className,...rest } = options;

    if (parentElement instanceof HTMLElement) {
      this.#parentElement = parentElement;
    } else if (parent instanceof HTMLElement) {
      this.#parentElement = parent;
    }
    
    if (parent instanceof MenuItem) {
      this.#parent = parent;
    } else if (parentElement instanceof MenuItem) {
      this.#parent = parentElement;
    }

    if (!this.#parentElement) {
      if (this.#parent && this.#parent.#element instanceof HTMLElement)
        this.#parentElement = this.#parent.#subMenuElement;

      if (!this.#parentElement)
        this.#parentElement = document.body;
    }

    this.#element = element ?? document.createElement('div');

    this.#parentElement.appendChild(this.#element);

    this.onMouseOver = this.handleMouseOver.bind(this);
    this.#element.addEventListener('mouseover', this.onMouseOver);
    this.onMouseOut = this.handleMouseOut.bind(this);
    this.#element.addEventListener('mouseout', this.onMouseOut);
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.#element.addEventListener('mousedown', this.onMouseDown);

    this.#labelElement = document.createElement('span');
    this.#element.appendChild(this.#labelElement);

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

    this.#element.removeEventListener('mouseover', this.onMouseOver);
    this.#element.removeEventListener('mouseout', this.onMouseOut);
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
    this.#labelElement.innerHTML = label;
  }

  get label() {
    return this.#labelElement.innerHTML;
  }

  set items(items) {
    for (const item of this.#items || []) {
      item.destroy();
    }
    this.#items = [];
    this.#subMenuElement?.remove();
    this.#subMenuElement = null;
    this.#element.classList.remove('has-submenu');
    this.addItem(...items);
  }

  addItem(...items) {
    if (!this.#subMenuElement) {
      this.#subMenuElement = document.createElement('div');
      this.#subMenuElement.classList.add('submenu', 'hidden');
      this.#element.appendChild(this.#subMenuElement);
      this.#element.classList.add('has-submenu');
    }

    for (const item of items) {
      this.#items.push(new MenuItem({
        parent: this,
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

  setPos(x, y) {
    this.#element.style.left = `${x}px`;
    this.#element.style.top = `${y}px`;
  }

  showSubmenu() {
    this.#subMenuElement?.classList.remove('hidden');
  }

  hideSubmenu() {
    this.#subMenuElement?.classList.add('hidden');
  }

  toggleSubmenu() {
    if (this.#subMenuElement) {
      if (this.#subMenuElement.classList.contains('hidden')) {
        this.#subMenuElement.classList.remove('hidden');
      } else {
        this.#subMenuElement.classList.add('hidden');
      }
    }
  }

  getFocusedItem() {
    if (this.#element.classList.contains('focused'))
      return this;

    for (const item of this.#items) {
      const focusedItem = item.getFocusedItem();
      if (focusedItem)
        return focusedItem;
    }
  }

  clearFocus() {
    let root = this;
    while (root.#parent) {
      root = root.#parent;
    }

    let focused;
    while (focused = root.getFocusedItem())
      focused.#element.classList.remove('focused');
  }

  setFocus() {
    this.clearFocus();
    this.#element.classList.add('focused');
  }

  focusByIndex(index) {
    const length = this.#items.length;
    if (!length)
      return;

    if (index < 0 || index >= this.#items.length)
      index = 0;

    this.#items[index]?.setFocus();
  }

  focusOffset(offset) {
    const length = this.#parent.#items.length;
    if (!length)
      return;

    let index = (this.#parent.#items.indexOf(this) || 0) + offset;
    if (index < 0) {
      if (this.wrapAround)
        index = length - 1;
      else
        index = 0;
    } else if (index >= length) {
      if (this.wrapAround)
        index = 0;
      else
        index = length - 1;
    }

    this.#parent.#items[index]?.setFocus();
  }

  execAction(event) {
    if (this.action) {
      event?.stopPropagation();
      event?.preventDefault();

      this.action({
        menuItem: this,
        data: this.data,
        event,
      });
    }

    if (this.hasSubmenu) {
      event?.stopPropagation();
      event?.preventDefault();

      if (this.#subMenuElement.style.display == 'block') {
        this.#subMenuElement.style.display = 'none';
      } else {
        this.#subMenuElement.style.display = 'block';
      }
    }
  }

  handleMouseOver() {
    this.#element.classList.add('active');
  }

  handleMouseOut() {
    this.#element.classList.remove('active');
  }

  handleMouseDown(event) {
    this.execAction(event);
  }

  handleKeyDown(event) {
    const focusedItem = this.getFocusedItem();
    if (focusedItem && focusedItem !== this) {
      focusedItem.handleKeyDown(event);
      return;
    }

    switch (event.key) {
      case 'Escape':
        if (this.#element.classList.contains('floating')) {
          this.hide();
        } else {
          this.hideSubmenu();
        }
        return;

      case 'Enter':
        this.execAction(event);
        return;

      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        if (focusedItem) {
          focusedItem.focusOffset(1);
        } else if (this.#items.length > 0) {
          this.focusByIndex(0);
        }
        return;

      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (focusedItem) {
          focusedItem.focusOffset(-1);
        } else if (this.#items.length > 0) {
          this.focusByIndex(0);
        }
        return;

      case 'ArrowRight':
        if (focusedItem && focusedItem.hasSubmenu) {
          event.preventDefault();
          event.stopPropagation();
          focusedItem.showSubmenu();
          focusedItem.focusByIndex(0);
        }
        return;

      case 'ArrowLeft':
        if (this.#parent) {
          event.preventDefault();
          event.stopPropagation();
          this.#parent.setFocus();
          this.#parent.hideSubmenu();
        }
        return;
    }
  }
}