import { importCss } from '../utils/import-css.js';
import MenuItem from '../menu-item/menu-item.js';

importCss('./menu.css', import.meta.url);

export default class Menu extends MenuItem {
  constructor(options) {
    super(options);
    this.addClass('menu');
  }
}