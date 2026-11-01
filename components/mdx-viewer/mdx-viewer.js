import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import { addLocaleUrl, _, onLanguageLoaded } from '../locale/locale.js';

importCss('./mdx-viewer.css', import.meta.url);

export default class MdxViewer extends Base {
  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    super.create({ ...options, defaultParentElement: document.body });

    this.element ??= document.createElement('div');

    this.element.classList.add('mdx-viewer');
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }
}
