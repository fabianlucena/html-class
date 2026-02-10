import { importCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import { _ } from '../locale/locale.js';
import { newId } from '../utils/id.js';

importCss('./screen.css', import.meta.url);

export default class Screen extends Base {
  #name = '';
  #proj = null;
  #headerElement = null;
  #messageElement = null;
  #contentElement = null;

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = value;
  }

  get proj() {
    return this.#proj;
  }

  set proj(value) {
    this.#proj = value;
  }

  get headerElement() {
    return this.#headerElement;
  }

  get messageElement() {
    return this.#messageElement;
  }

  get contentElement() {
    return this.#contentElement;
  }

  create(options = {}) {
    super.create(options);

    this.id ||= newId();
    this.name ||= _('Unnamed');

    if (!this.element) {
      this.element = document.createElement('div');
      document.body.appendChild(this.element);
    }

    this.element.classList.add('proj-screen', 'hidden');

    if (!this.headerElement) {
      this.#headerElement = document.createElement('h2');
      this.element.appendChild(this.headerElement);
    }

    if (!this.messageElement) {
      this.#messageElement = document.createElement('h3');
      this.element.appendChild(this.messageElement);
    }

    this.#messageElement.className = 'proj-screen-message';

    if (!this.contentElement) {
      this.#contentElement = document.createElement('div');
      this.element.appendChild(this.contentElement);
    }

    this.#contentElement.className = 'proj-screen-content';
  }

  show(visible = true) {
    if (visible)
      this.element.classList.remove('hidden');
    else
      this.element.classList.add('hidden');
  }

  showed() {
    return !this.element.classList.contains('hidden');
  }

  render() {
    this.headerElement.textContent = this.name;

    if (!this.proj) {
      this.messageElement.textContent = '<p>No project assigned.</p>';
      return;
    }

    if (!this.proj.issues.length) {
      this.messageElement.textContent = '<p>No issues to display.</p>';
      return;
    }

    this.messageElement.textContent = '';
  }
}