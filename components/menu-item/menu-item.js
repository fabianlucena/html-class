import { importCss } from '../utils/import-css.js';
import Base from '../utils/base.js';

importCss('./menu-item.css', import.meta.url);

export default class MenuItem extends Base {
  #parent = null;
  #itemsElement = null;
  #labelElement = null;
  #items = [];

  wrapAround = true;

  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    if (!options.element)
      options.element = document.createElement('div');

    this.#labelElement = document.createElement('span');

    super.create(options);

    this.addClass('menu-item');

    this.onMouseOver = this.handleMouseOver.bind(this);
    this.element.addEventListener('mouseover', this.onMouseOver);
    this.onMouseOut = this.handleMouseOut.bind(this);
    this.element.addEventListener('mouseout', this.onMouseOut);
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.element.addEventListener('mousedown', this.onMouseDown);

    this.element.appendChild(this.labelElement);

    if (options.parent) {
      this.parent = options.parent;
    }
  }

  destroy() {
    for (const item of this.items) {
      item.destroy();
    }

    if (this.element) {
      this.element.removeEventListener('mouseover', this.onMouseOver);
      this.element.removeEventListener('mouseout', this.onMouseOut);
      this.element.removeEventListener('mousedown', this.onMouseDown);
    }

    super.destroy();
  }

  get parent() {
    return this.#parent;
  }

  set parent(newParent) {
    if (this.parent === newParent)
      return;

    this.#parent = newParent;
    if (this.#parent) {
      this.parentElement = this.parent.itemsElement;
      this.parent.items.push(this);
    }
  }

  get labelElement() {
    return this.#labelElement;
  }

  get label() {
    return this.labelElement.innerHTML;
  }

  set label(label) {
    this.labelElement.innerHTML = label;
  }

  get items() {
    return this.#items;
  }

  get itemsElement() {
    return this.#itemsElement;
  }

  set items(items) {
    for (const item of this.items || []) {
      item.destroy();
    }
    this.#items = [];
    this.#itemsElement?.remove();
    this.#itemsElement = null;
    this.element.classList.remove('has-submenu');
    this.addItem(...items);
  }

  addItem(...items) {
    if (!this.itemsElement) {
      this.#itemsElement = document.createElement('div');
      this.itemsElement.classList.add('submenu', 'hidden');
      this.element.appendChild(this.itemsElement);
      this.element.classList.add('has-submenu');
    }

    for (const item of items) {
      new MenuItem({
        parent: this,
        ...item
      });
    }
  }

  removeItem(item) {
    if (this.parent) {
      this.#parent.items = this.#parent.items.filter((item) => item !== this);
    }
  }

  get hasSubmenu() {
    return this.items.length > 0;
  }

  get showing() {
    return this.display;
  }

  setPos(x, y) {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  showSubmenu() {
    this.itemsElement?.classList.remove('hidden');
  }

  hideSubmenu() {
    this.itemsElement?.classList.add('hidden');
  }

  toggleSubmenu() {
    if (this.itemsElement) {
      if (this.itemsElement.classList.contains('hidden')) {
        this.itemsElement.classList.remove('hidden');
      } else {
        this.itemsElement.classList.add('hidden');
      }
    }
  }

  getFocusedItem() {
    if (this.element.classList.contains('focused'))
      return this;

    for (const item of this.items) {
      const focusedItem = item.getFocusedItem();
      if (focusedItem)
        return focusedItem;
    }
  }

  clearFocus() {
    let root = this;
    while (root.parent) {
      root = root.parent;
    }

    let focused;
    while (focused = root.getFocusedItem())
      focused.element.classList.remove('focused');
  }

  setFocus() {
    this.clearFocus();
    this.element.classList.add('focused');
  }

  focusByIndex(index) {
    const length = this.items.length;
    if (!length)
      return;

    if (index < 0 || index >= this.items.length)
      index = 0;

    this.items[index]?.setFocus();
  }

  focusOffset(offset) {
    const length = this.parent.items.length;
    if (!length)
      return;

    let index = (this.parent.items.indexOf(this) || 0) + offset;
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

    this.parent.items[index]?.setFocus();
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

      if (this.itemsElement.style.display == 'block') {
        this.itemsElement.style.display = 'none';
      } else {
        this.itemsElement.style.display = 'block';
      }
    }
  }

  handleMouseOver() {
    this.element.classList.add('active');
  }

  handleMouseOut() {
    this.element.classList.remove('active');
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
        if (this.element.classList.contains('floating')) {
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
        } else if (this.items.length > 0) {
          this.focusByIndex(0);
        }
        return;

      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (focusedItem) {
          focusedItem.focusOffset(-1);
        } else if (this.items.length > 0) {
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
        if (this.parent) {
          event.preventDefault();
          event.stopPropagation();
          this.parent.setFocus();
          this.parent.hideSubmenu();
        }
        return;
    }
  }
}