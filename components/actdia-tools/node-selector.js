import { importCss } from '../utils/import-css.js';
import Dialog from '../dialog/dialog.js';
import Item from '../actdia/item.js';
import { _, loadLocale } from '../locale/locale.js';

importCss('./node-selector.css', import.meta.url);

export default class NodeSelector extends Dialog {
  breadcrumbsContainer = null;
  categoriesContainer = null;
  classesContainer = null;
  destroyOnClose = false;

  breadcrumbs = [];
  categories = [];
  nodesClasses = [];
  className = 'node-selector';

  constructor({ container, actdia }) {
    super(...arguments);
    this.actdia = actdia;

    this.contentElement.innerHTML = '<div class="node-selector-breadcrumbs" ></div>'
      + '<div class="node-selector-categories" ></div>'
      + `<div class="node-selector-classes" >${_('Loading...')}</div>`;

    this.breadcrumbsContainer = this.contentElement.querySelector('.node-selector-breadcrumbs');
    this.categoriesContainer = this.contentElement.querySelector('.node-selector-categories');
    this.classesContainer = this.contentElement.querySelector('.node-selector-classes');

    this.breadcrumbsContainer.addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();

      const breadcrumbDiv = evt.target.closest('.node-breadcrumb');
      if (breadcrumbDiv?.dataset?.url) {
        this.loadCategory({
          path: breadcrumbDiv.dataset.url,
          previousBreadcrumbs: this.breadcrumbs.filter(b => b.url.length < breadcrumbDiv.dataset.url.length),
        });
      }
    });

    this.categoriesContainer.addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();

      const categoryDiv = evt.target.closest('.node-category');
      if (categoryDiv?.dataset?.url) {
        this.loadCategory({
          path: categoryDiv.dataset.url,
          previousBreadcrumbs: [...this.breadcrumbs],
        });
      }
    });

    this.classesContainer.addEventListener('click', evt => this.classesClickHandler(evt));
  }

  show({ path, defaultPath } = {}) {
    super.show(
      {
        header: _('Add node'),
        okButton: false,
        cancelButton: false,
        closeButton: true,
      },
      ...arguments
    );
    
    if (path) {
      this.loadCategory({ path });
    } else if (!this.categories?.length && defaultPath) {
      this.loadCategory({ path: defaultPath });
    }
  }

  async loadCategory({ path, previousBreadcrumbs = [] }) {
    try {
      this.classesContainer.innerHTML = _('Loading...');
      const categoriesData = (await import(/* @vite-ignore */ `${path}/index.js`)).default;

      this.breadcrumbs = [
        ...previousBreadcrumbs,
        {
          _label: categoriesData._label,
          url: path,
        }
      ];

      await loadLocale(`${path}/locale`, { languages: categoriesData.locale });

      this.categories = categoriesData.categories || [];
      this.nodesClasses = categoriesData.nodesClasses || [];
      this.examples = categoriesData.examples || [];

      this.update({ path });
    } catch (err) {
      this.classesContainer.innerHTML = _('Error loading node category: %s', err.message);
    }
  }

  async update({ path }) {
    this.breadcrumbsContainer.innerHTML = this.breadcrumbs
      .map(b => '<div'
          + ` class="node-breadcrumb"`
          + ` data-url="${b.url}"`
        + ` >${_(b._label)}</div>`)
      .join('');

    this.categoriesContainer.innerHTML = this.categories
      ?.map(c => '<div'
          + ` class="node-category"`
          + ` data-url="${path}/${c.url}"`
        + ` >${_(c._label)}</div>`)
      .join('') || '';

    const options = {
      width: 170,
      height: 90,
      padding: 10,
    };

    const urls = this.nodesClasses.map(c => `${path}/${c}`);

    const classesInfo = await this.actdia.importElements(...urls);

    this.classesContainer.innerHTML = classesInfo
      .map(classInfo => {
        const itemOptions = {};
        const item = Item.create(classInfo);

        itemOptions.sx = Math.min(
          (options.width -  options.padding * 2) / item.box.width,
          (options.height - options.padding * 2) / item.box.height,
        );
        itemOptions.sx *= 1;
        itemOptions.sy = itemOptions.sx;
        item.x = (options.width /  (2 * itemOptions.sx) - (item.box.x + item.box.width  / 2));
        item.y = (options.height / (2 * itemOptions.sy) - (item.box.y + item.box.height / 2));

        let html = `<div
            class="node-class"
            data-fqcn="${classInfo.fqcn}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" >
              ${this.actdia.getItemSVG(item, itemOptions)}
            </svg>
            <div
              class="node-class-name"
            >
              ${_(classInfo._label)}
            </div>
          </div>`;
        return html;
      })
      .filter(html => html)
      .join('');

    this.classesContainer.innerHTML += this.examples
      .map(example => {
        let html = `<div
            class="example"
            data-url="${path}/${example.url}"
          >
            <img src="${path}/${example.image}" alt="Gráfico SVG" width="${options.width}" height="${options.height}" />
            <div
              class="example-name"
            >
              ${_(example._label)}
            </div>
          </div>`;
        return html;
      })
      .filter(html => html)
      .join('');
  }

  classesClickHandler(evt) {
    if (this.onSelectNode) {
      const classDiv = evt.target.closest('.node-class');
      const fqcn = classDiv?.dataset?.fqcn;
      if (fqcn) {
        this.onSelectNode({ evt, fqcn });
        return;
      }
    }

    if (this.onSelectExample) {
      const exampleDiv = evt.target.closest('.example');
      const url = exampleDiv?.dataset?.url;
      if (url) {
        this.onSelectExample({ evt, url });
        return;
      }
    }
  }
}