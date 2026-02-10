import actdiaItemsCss from './actdia-items.css?raw';
import './actdia.css';
import Element from './element.js';
import Item from './item.js';
import Node from './node.js';
import Connection from './node.js';
import { isItem, isNode, isConnection } from './type.js';
import { escapeHTML, isHTMLElement } from '../utils/html.js';
import { getNumber, isNumber } from '../utils/type.js';
import { getPath } from '../utils/string.js';
import { _, loadLocale, getLocales, loadLocales } from '../locale/locale.js';
import { DIRECTIONS } from './connector.js';

export default class ActDia {
  style = {
    sx: 16,
    sy: 16,
    snap: true,
    mouseOverThreshold: 5,
    dpi: 96,
    page: {
      format: 'A4 landscape',
      width: 297,
      height: 210,
    },

    node: {
    },

    name: {
      fontSize: 0.6,
      fontfill: '#A8A8A8',
      textAnchor: 'right',
      dominantBaseline: 'bottom',
    },

    in: {
      shape: {
        shapes: [
          {
            shape: 'circle',
            cx: 0,
            cy: 0,
            r: 0.5,
          },
          {
            shape: 'path',
            d: `M 0.3 -0.3
              L -0.4 0
              L  0.3 0.3`,
          },
        ],
      },
      styles: {
        small: {
          shape: {
            shapes: [
              {
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 0.3,
              },
              {
                shape: 'path',
                d: `M 0.2 -0.2
                  L -0.2 0
                  L  0.2 0.2`,
              },
            ],
          },
        },
        tiny: {
          shape: {
            shapes: [
              {
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 0.2,
              },
              {
                shape: 'path',
                d: `M 0.1 -0.1
                  L -0.15 0
                  L  0.1 0.1`,
              },
            ],
          },
        },
      },
    },

    out: {
      shape: {
        shapes: [
          {
            shape: 'circle',
            cx: 0,
            cy: 0,
            r: 0.5,
          },
          {
            shape: 'path',
            d: `M -0.3 -0.3
              L  0.4 0
              L -0.3 0.3`,
          },
        ],
      },
      styles: {
        small: {
          shape: {
            shapes: [
              {
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 0.3,
              },
              {
                shape: 'path',
                d: `M -0.2 -0.2
                  L  0.2 0
                  L -0.2 0.2`,
              },
            ],
          },
        },
        tiny: {
          shape: {
            shapes: [
              {
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 0.2,
              },
              {
                shape: 'path',
                d: `M -0.1 -0.1
                  L  0.15 0
                  L -0.1 0.1`,
              },
            ],
          },
        },
      },
    },

    io: {
      shape: {
        shapes: [
          {
            shape: 'circle',
            cx: 0,
            cy: 0,
            r: 0.5,
          },
          {
            shape: 'path',
            d: `M 0.3 -0.3
              L -0.4 0
              L  0.3 0.3`,
          },
        ],
      },
      styles: {
        tiny: {
          shape: {
            shapes: [
              {
                shape: 'circle',
                cx: 0,
                cy: 0,
                r: 0.2,
              },
              {
                shape: 'path',
                d: `M 0.1 -0.1
                  L -0.15 0
                  L  0.1 0.1`,
              },
            ],
          },
        }
      },
    },

    connection: {},

    selectedItem: {
      offset: .5,
    },
  };

  mouse = {
    x: 0,
    y: 0,
    down: null,
  };

  #items = [];
  dragging = null;
  selectedConnections = [];
  onPushNotification = null;

  get items() {
    return this.#items;
  }

  constructor(options) {
    this.create(...arguments);
  }

  async init() {
    await loadLocale('.', 'es');
    await this.importElements(
      './node.js',
      './connection.js',
      './connector-in.js',
      './connector-out.js'
    );
  }

  pushNotification(message, options = {}) {
    if (this.onPushNotification)
      this.onPushNotification(message, options);
    else
      console.log(message);
  }

  getElementCreationData() {
    return {
      actdia: this,
      _,
      getPath,
      Element,
      Item,
      Node,
      Connection,
    };
  }

  async importElements(...urls) {
    return Element.importAsync(this.getElementCreationData(), ...urls);
  }

  async importElementClass(url) {
    const classesInfo = await this.importElements(url);
    return classesInfo.reduce((map, ci) => {
      map[ci.elementClass] = ci.classRef;
      return map;
    }, {});
  }

  create(options) {
    Object.assign(this, ...arguments);
    if (!this.container)
      throw new Error(_('No container element to setup ActDia.'));

    this.container.classList.add('actdia');
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.container.appendChild(this.svg);
    this.svg.tabIndex = 0;
    this.svg.focus();
    this.adjustSize();

    this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.mainGroup.setAttribute('transform', `scale(${this.style.sx},${this.style.sy})`);
    this.svg.appendChild(this.mainGroup);
    
    this.canvasLayerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.canvasLayerSVG.classList.add('actdia-canvas-layer');
    this.mainGroup.appendChild(this.canvasLayerSVG);

    this.connectionsLayerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.connectionsLayerSVG.classList.add('actdia-connections-layer');
    this.mainGroup.appendChild(this.connectionsLayerSVG);

    this.nodesLayerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesLayerSVG.classList.add('actdia-nodes-layer');
    this.mainGroup.appendChild(this.nodesLayerSVG);

    this.othersLayerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.othersLayerSVG.classList.add('actdia-others-layer');
    this.mainGroup.appendChild(this.othersLayerSVG);
    
    this.appendSVGFragment(this.canvasLayerSVG, this.getGridSVG());
    this.appendSVGFragment(this.canvasLayerSVG, this.getPageSVG());
    
    this.label = document.createElement('div');
    this.label.classList.add('actdia-label');
    this.label.style.display = 'none';
    this.label.style.position = 'absolute';
    this.container.appendChild(this.label);

    window.addEventListener('load', () => this.adjustSize());
    window.addEventListener('resize', () => this.adjustSize());

    document.body.addEventListener('mousemove', evt => this.mouseMoveHandler(evt), true);
    this.svg.addEventListener('mouseover', evt => this.mouseOverHandler(evt));
    this.svg.addEventListener('mouseout', evt => this.mouseOutHandler(evt));
    this.svg.addEventListener('click', evt => this.clickHandler(evt));
    this.svg.addEventListener('contextmenu', evt => this.contextMenuHandler(evt));
    this.svg.addEventListener('dblclick', evt => this.dblClickHandler(evt));
    this.svg.addEventListener('mousedown', evt => this.mouseDownHandler(evt));
    this.svg.addEventListener('mouseup', evt => this.mouseUpHandler(evt));
    window.addEventListener('beforeprint', () => this.container.classList.add('print'));
    window.addEventListener('afterprint', () => this.container.classList.remove('print'));
  }

  addEventListener(eventName, handler, bubbles) {
    this.svg.addEventListener(eventName, handler, bubbles);
  }

  parseSVGFragment(svgFragment) {
    const parser = new DOMParser();
    const doc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + svgFragment + '</svg>', 'image/svg+xml');
    return [...doc.documentElement.childNodes]
      .filter(node => node.nodeType === 1);
  }

  importSVGFragment(svgFragment) {
    const elements = this.parseSVGFragment(svgFragment);
    return elements.map(element => document.importNode(element, true));
  }

  appendSVGFragment(node, svgFragment) {
    const elements = this.importSVGFragment(svgFragment);
    elements.forEach(element => node.appendChild(element));
    return elements;
  }

  getData(options = {}) {
    let items = options.items ?? this.#items;

    const nodes = items
      .filter(node => isNode(node))
      .map(node => {
        const data = node.getData();
        if (options.noSelectedProperty) {
          delete data.selected;
        }
        return data;
      });

    const connections = items
      .filter(isConnection)  
      .map(connection => connection.getData());

    const imports = [...new Set([
        ...nodes.map(item => item.url),
        ...nodes.map(item => item.connectors?.map(connector => connector.url)).flat(),
        ...connections.map(item => item.url),
      ].filter(u => u))]
      .sort();

    const allLocales = getLocales();
    let locales = {};
    const allPaths = imports.map(getPath);
    for (const url in allLocales) {
      if (!allPaths.includes(url))
        continue;

      locales[url] = allLocales[url];
    }
    
    const data = {
      actdia: {
        version: '0.1.0',
      },
      imports,
      locales,
      nodes,
      connections,
    };

    return data;
  }

  getExportableItems({ selected, items, onlySelected } = {}) {
    if (items?.length)
      return items;

    const exportable = this.#items.filter(i => i.exportable !== false);
    if (selected || onlySelected) {
      const selected = exportable.filter(i => i.selected
        || isConnection(i) && (i.from.item?.selected && i.to?.item?.selected)
      );

      if (onlySelected || selected.length)
        return selected;
    }

    return exportable;
  }

  clear() {
    this.#items = [];
    this.nodesLayerSVG.innerHTML = '';
    this.connectionsLayerSVG.innerHTML = '';
    this.othersLayerSVG.innerHTML = '';
  }

  async load(data, options = {}) {
    if (options.clear !== false) {
      this.clear();
    }

    if (options.clearSelection) {
      this.#items.forEach(item => item.selected = false);
    }
    
    await loadLocales(data.locales);
    await this.importElements(...data.imports.filter(u => u));

    const newNodes = await this.addOptionsItem(
      {
        incrementalPosition: options.incrementalPosition,
        autoselect: options.autoselect,
      },
      ...data.nodes
    );
    
    const oldIds = data.nodes.map(i => i.id);
    const newIds = newNodes.map(i => i.id);
    const mapIds = Object.fromEntries(oldIds.map((k, i) => [k, newIds[i]]));

    data.connections.forEach(connectionData => {
      if (connectionData.from?.item && mapIds[connectionData.from.item]) {
        connectionData.from.item = mapIds[connectionData.from.item];
      }

      if (connectionData.to?.item && mapIds[connectionData.to.item]) {
        connectionData.to.item = mapIds[connectionData.to.item];
      }
    });

    await this.addOptionsItem(
      {
        elementClass: 'Connection',
        autoselect: options.autoselect,
      },
      ...data.connections
    );

    this.#items.forEach(item => {
      if (isNode(item) && item.autoPropagate) {
        item.propagate();
      }
    });
  }

  async addItem(...items) {
    const result = await this.addOptionsItem({}, ...items);
    if (!result.length) {
      return null;
    }

    return result.length === 1 ? result[0] : result;
  }

  async addOptionsItem(options, ...items) {
    if (!items.length) {
      return [];
    }

    let inc = 0;
    if (options.incrementalPosition) {
      inc = options.incrementalPosition;
      if (isNaN(inc)) {
        inc = 1;
      }
    }

    const result = [];
    for (let item of items) {
      if (!(item instanceof Element)) {
        item = await Element.loadAndCreateAsync(
          {
            actdia: this,
            items: this.#items,
          },
          options,
          item,
        );
      } else {
        item.actdia = this;
      }
      
      while (this.#items.find(n => n.id === item.id)) {
        item.id = crypto.randomUUID();
      }

      this.autoNameForItem(item);

      item.x += inc;
      item.y += inc;
      item.selected = options.autoselect ? true : item.selected;

      item.update({ skipNotification: true });
      
      result.push(item);
      this.#items.push(item);
    }

    const dict = {
      connection: 0,
      node: 1,
    };
    
    this.#items.sort((a, b) => (dict[a.type] ?? 99) - (dict[b.type] ?? 99));

    result.forEach(item => {
      const textSVG = this.getItemSVG(item, { escapeHTML: true });
      let node;
      if (isNode(item)) {
        node = this.nodesLayerSVG;
      } else if (isConnection(item)) {
        node = this.connectionsLayerSVG;
      } else {
        node = this.othersLayerSVG;
      }

      item.svgElement = this.appendSVGFragment(node, textSVG)[0];
      item.svgShape = item.svgElement?.querySelector('.actdia-shape');
      item.svgSelectionBox = item.svgElement?.querySelector('.actdia-selection-box');
      item.svgConnectors = item.svgElement?.querySelector('.actdia-connectors');
      item.update();
    });

    return result;
  }

  autoNameForItem(item) {
    if (item.name) {
      return;
    }

    let rootName;
    if (item.constructor._label) {
      rootName = _(item.constructor._label);
    } else if (item.constructor.label) {
      rootName = _(item.constructor.label);
    } else {
      rootName = item.constructor.name;
    }

    let sanitizedId = item.id.replace(/[^a-zA-Z0-9]/g, '');
    let name;
    let index = 1;
    do {
      let coda = sanitizedId.substring(index, index + 5);
      if (!coda) {
        break;
      }

      if (coda.length < 5) {
        coda += randomString(5 - coda.length);
      }

      name = rootName + ' - ' + coda;
    } while (this.items?.find(i => i.name === name));

    index = 1;
    while (this.items.find(i => i.name === name)) {
      name = rootName + ' - ' + String(index).padStart(5, '0');
      index++;
    }

    item.name = name;
  }

  updateItemShape(shape) {
    let extendsTo = shape.extends;
    while (extendsTo) {
      for (const key of Object.keys(extendsTo)) {
        shape[key] = extendsTo[key];
      }

      extendsTo = extendsTo.extends;
    }
  }

  deleteSelected() {
    this.deleteSelectedItems();
  }

  deleteSelectedItems() {
    return this.deleteItem(...this.#items.filter(i => i.selected));
  }

  deleteItem(...items) {
    const newItems = this.#items
      .filter(connection => !isConnection(connection)
          || !items.includes(connection.from?.item)
          && !items.includes(connection.to?.item)
        )
      .filter(item => !items.includes(item));

    const deletedItems = this.#items.filter(item => !newItems.includes(item));
    this.#items.forEach(item => item.removeReferencedItems(...deletedItems));
    this.#items = newItems;

    deletedItems.forEach(item => {
      item.removeReferences();
      this.svg.querySelector(`#${CSS.escape(item.id)}`)?.remove();
    });
  }

  adjustSize() {
    const { dpi, sx, sy, page } = this.style;

    this.pageWidth = Math.floor(page.width * dpi / 25.4);
    this.pageHeight = Math.floor(page.height * dpi / 25.4);

    this.pixelsWidth = Math.max(this.pageWidth, this.container.offsetWidth);
    this.pixelsHeight = Math.max(this.pageHeight, this.container.offsetHeight);

    this.width = this.pixelsWidth / sx;
    this.height = this.pixelsHeight / sy;

    this.svg.setAttribute('width', this.pixelsWidth);
    this.svg.setAttribute('height', this.pixelsHeight);
  }

  async getSVG(items, options) {
    items ??= this.#items;
    options ??= { prefix: '\n', tab: '  ', includeStyles: true };
    options.prefix ??= '\n';
    options.tab ??= ' ';

    const
      baseOptions = { ...options, prefix: options.prefix + options.tab },
      layersOptions = { ...options, prefix: baseOptions.prefix + baseOptions.tab },
      itemsOptions = { escapeHTML: true, ...options, prefix: layersOptions.prefix + options.tab };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.svg.clientWidth}" height="${this.svg.clientHeight}">`
        + (options.includeStyles && this.getSVGStyles(layersOptions) || '')
        + baseOptions.prefix + '<g'
          + layersOptions.prefix + `class="actdia"`
          + layersOptions.prefix + `transform="scale(${this.style.sx},${this.style.sy})"`
        + baseOptions.prefix + '>'
          + layersOptions.prefix + '<g'
            + itemsOptions.prefix + 'class="actdia-connections-layer"'
          + layersOptions.prefix + '>'
            + items
              .filter(isConnection)
              .map(item => this.getItemSVG(item, itemsOptions))
              .filter(e => e)
              .join('')
          + layersOptions.prefix + '</g>'
          + layersOptions.prefix + '<g'
            + itemsOptions.prefix + 'class="actdia-nodes-layer"'
          + layersOptions.prefix + '>'
            + items
              .filter(isNode)
              .map(item => this.getItemSVG(item, itemsOptions))
              .filter(e => e)
              .join('')
          + layersOptions.prefix + '</g>'
          + layersOptions.prefix + '<g'
            + itemsOptions.prefix + 'class="actdia-others-layer"'
          + layersOptions.prefix + '>'
            + items
              .filter(item => !isConnection(item) && !isNode(item))
              .map(item => this.getItemSVG(item, itemsOptions))
              .filter(e => e)
              .join('')
          + layersOptions.prefix + '</g>'
        + baseOptions.prefix + '</g>'
      + options.prefix + '</svg>';

    return svg;
  }

  getSVGStyles(options) {
    options ??= {};
    options.prefix ??= '\n';
    options.tab ??= ' ';

    const prefix1 = options.prefix + options.tab;
    return options.prefix + '<style>'
        + prefix1 + actdiaItemsCss.replace(/\n/g, prefix1)
      + options.prefix + '</style>';
  }

  getGridSVG(options) {
    return `<g class="actdia-grid">
        <defs>
          <pattern id="dots" x="-.09" y="-.09" width="1" height="1" patternUnits="userSpaceOnUse">
            <path
              d="M .2 .1 H 0 M .1 0 V .2"
            />
          </pattern>

          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10" 
              class="major-grid"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="${this.pixelsWidth}" height="${this.pixelsHeight}" fill="url(#dots)" />
        <rect
          x="0"
          y="0"
          width="${this.pixelsWidth}"
          height="${this.pixelsHeight}"
          fill="url(#grid)"
        />
      </g>`;
  }

  getPageSVG(options) {
    return `<rect class="actdia-page" x="0" y="0"
        width="${this.pageWidth}" height="${this.pageHeight}"
      />`;
  }

  getItemMainShape(item) {
    let shape = { ...item.shape };
    shape.classList ??= [];
    shape.classList.push('actdia-shape');

    return shape;
  }

  getItemSVG(item, options) {
    options ??= {};
    options.prefix ??= '\n';
    options.tab ??= ' ';

    if (item.getSVG) {
      item.getSVG(this, options);
      return;
    }

    const { sx, sy, ...childOptions } = {
      ...options,
      prefix: options.prefix + options.tab,
    };

    const components = [];
    if (!item.noSelectionBox) {
      components.push(this.getSelectedRectSVG(item, childOptions));
    }
    let shape = { ...item.shape };
    if (shape.shape && shape.shape !== 'g') {
      shape = { shapes: [ shape ] };
    }

    components.push(this.getShapeSVG(
      this.getItemMainShape(item),
      item,
      childOptions,
    ));
    if (!item.noNameText) {
      const textStyle = {
        item,
        shape: item.box,
        className: 'actdia-node-name',
        options: childOptions,
      };

      if (item.showName)
        textStyle.display = 'block';

      components.push(this.getShapeSVG(
        {
          shape: 'text',
          text: item.name || item.id || item.constructor.name,
          ...item.box,
        },
        item,
        {
          ...childOptions,
          style: this.getStyle(textStyle),
        },
      ));
    }
    components.push(this.getConnectorsSVG(item, childOptions));

    const itemType = item.type,
      elementClass = item.constructor.name;

    let classList = [
      'actdia-item',
      (itemType && `actdia-${itemType}` || ''),
      (elementClass && `actdia-item-${elementClass.toLowerCase()}` || ''),
      (item.className || ''),
      ...(item.classList || []),
      (item.selected && 'actdia-selected' || '')
    ].filter(c => c);

    const
      x = (item.x ?? 0),
      y = (item.y ?? 0);

    let transform = '';
    if (!isNaN(sx) || !isNaN(sy)) transform += ` scale(${sx ?? 1}, ${sy ?? 1})`;
    if ((!isNaN(x) && x) || (!isNaN(y) && y)) transform += ` translate(${x}, ${y})`;
    if (transform) {
      transform = ` transform="${transform.trim()}"`;
    }

    const url = item.getElementClassUrl();

    const svg = options.prefix + '<g'
        + (item.id && (childOptions.prefix + `id="${escapeHTML(item.id)}"`) || '')
        + (item.name && (childOptions.prefix + `name="${escapeHTML(item.name)}"`) || '')
        + childOptions.prefix + `class="${classList.join(' ')}"`
        + (item.description && (childOptions.prefix + `description="${escapeHTML(item.description)}"`) || '')
        + transform
        + childOptions.prefix + `data-item-class="${escapeHTML(item.getElementClass())}"`
        + (url && childOptions.prefix + `data-url="${escapeHTML(item.getElementClassUrl())}"` || '')
      + options.prefix + '>'
        + components.join('')
      + options.prefix + '</g>';

    return svg;
  }

  getStyle({ style, className, classList, item, shape, type, options, ...styles }) {
    style = {
      ...style,
      ...this.style.item,
      ...this.style[item.type],
      ...this.style[type],
      ...item.style,
      ...item.style?.[item.type],
      ...item.style?.[type],
      ...shape,
      ...shape?.[item.type],
      ...(typeof shape?.[type] === 'object') ? shape?.[type]: null,
    };

    const extendedList = [
      this.style.item?.extends,
      this.style[item.type]?.extends,
      this.style[type]?.extends,
      item.style?.extends,
      item.style?.[item.type]?.extends,
      item.style?.[type]?.extends,
      shape?.extends,
      shape?.[item.type]?.extends,
      shape?.[type]?.extends,
    ].filter(s => s)
      .flat(Infinity)
      .filter(s => s);

    const cascadeExtensions = [];
    for (let i = 0; i < extendedList.length; i++) {
      const extended = extendedList[i];
      style = {
        ...style,
        ...this.style[extended],
        ...style?.styles?.[extended],
      };
      if (style?.extends) {
        const moreExtensions = Array.isArray(style.extends) ? style.extends : [style.extends];
        for (const ext of moreExtensions) {
          if (!cascadeExtensions.includes(ext)) {
            cascadeExtensions.push(ext);
            extendedList.push(ext, ...extendedList);
          }
        }
      }
    }

    if (options?.sx)
      style.sx = options.sx;

    if (options?.sy)
      style.sy = options.sy;

    if (style.strokeWidth) {
      style.strokeWidth /= (style.sx + style.sy) / 2;
    }

    if (style.className) {
      style.classList ??= [];
      style.classList.push(style.className);
      delete style.className;
    }

    if (className) {
      style.classList ??= [];
      style.classList.push(className);
    }

    if (classList?.length) {
      style.classList ??= [];
      style.classList.push(...classList);
    }

    if (style.margin) {
      if (isNumber(style.margin)) {
        const margin = style.margin;
        style.margin = {
          top: margin,
          right: margin,
          bottom: margin,
          left: margin,
        };
      } else {
        style.margin = {
          top: getNumber(style.margin.top, 0),
          right: getNumber(style.margin.right, 0),
          bottom: getNumber(style.margin.bottom, 0),
          left: getNumber(style.margin.left, 0),
        };
      }
    } else {
      style.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
    }

    Object.assign(style, styles);

    return style;
  }

  getStyleSVGAttributes(style, options) {
    const attributes = {};
    const classList = [
      ...style.classList || [],
      options?.className,
      ...(options?.classList || []),
    ].filter(c => c);

    options?.id && (attributes.id = options.id);
    (style.name || options?.name) && (attributes.name = style.name ?? options.name);
    classList.length && (attributes.className = classList.join(' '));
    ('fill' in style) && (attributes.fill = style.fill);
    style.fill === false && (attributes.fill = 'none');
    ('stroke' in style) && (attributes.stroke = style.stroke);
    style.stroke === false && (attributes.stroke = 'none');
    ('strokeWidth' in style) && (attributes['stroke-width'] = style.strokeWidth);
    Array.isArray(style.dash) && style.dash.length && (attributes['stroke-dasharray'] = style.dash.join(' '));
    style.lineCap && (attributes['stroke-linecap'] = style.lineCap);
    style.lineJoin && (attributes['stroke-linejoin'] = style.lineJoin);
    style.miter && (attributes['stroke-miterlimit'] = style.miter);
    (style.opacity || style.opacity === 0) && (attributes.opacity = style.opacity);
    (options.style?.display) && (attributes.style = { ...attributes.style, display: options.style.display });

    if (style.visible || style.visible === false) {
      attributes.style ??= {};
      attributes.style.display = style.visible ? 'block' : 'none';
    }

    let transform = '';

    if (!isNaN(style.sx) || !isNaN(style.sy)) transform += ` scale(${style.sx ?? 1}, ${style.sy ?? 1})`;
    if ((!isNaN(style.x) && style.x) || (!isNaN(style.y) && style.y)) transform += ` translate(${style.x ?? 0}, ${style.y ?? 0})`;
    if (style.rotation) {
      let rotation = style.rotation;
      if (Array.isArray(rotation))
        rotation = rotation.join(' ');
      else
        rotation = `${rotation} ${style.rotationCenterX || 0} ${style.rotationCenterY || 0}`;

      transform += ` rotate(${rotation})`;
    }
    if (style.skewX) transform += ` skewX(${style.skewX})`;
    if (style.skewY) transform += ` skewY(${style.skewY})`;
    if (transform) attributes.transform = ((attributes.transform ? attributes.transform + ' ' : '') + transform).trim();

    return attributes;
  }

  getFontStyleSVGAttributes(style) {
    const attributes = {};
    const styleAttribute = {};
    let fontSize = isNaN(style.fontSize)? 1: style.fontSize;

    let textAnchor = style.textAnchor;
    if (textAnchor === 'left') {
      textAnchor = 'start';
    } else if (textAnchor === 'center') {
      textAnchor = 'middle';
    } else if (textAnchor === 'right') {
      textAnchor = 'end';
    }

    let dominantBaseline = style.dominantBaseline;
    if (dominantBaseline === 'top') {
      dominantBaseline = 'text-before-edge';
    } else if (dominantBaseline === 'middle') {
      dominantBaseline = 'central';
    } else if (dominantBaseline === 'bottom') {
      dominantBaseline = 'text-after-edge';
    } else if (!dominantBaseline) {
      dominantBaseline = 'central';
    }

    typeof style.fontfill !== 'undefined' && style.fontfill !== null && (attributes.fill = style.fontfill);
    typeof fontSize !== 'undefined' && fontSize !== null && (attributes['font-size'] = `${fontSize}`);
    typeof style.fontFamily !== 'undefined' && style.fontFamily !== null && (attributes.fontFamily = style.fontFamily);
    typeof textAnchor !== 'undefined' && textAnchor !== null && (styleAttribute['text-anchor'] = textAnchor);
    typeof dominantBaseline !== 'undefined' && dominantBaseline !== null && (styleAttribute['dominant-baseline'] = dominantBaseline);

    if (style.textDecoration)
      styleAttribute['text-decoration'] = style.textDecoration;
    if (Object.keys(styleAttribute).length) {
      attributes.style = styleAttribute;
    }

    return attributes;
  }

  getShapeSVGData(shape, item, options = {}) {
    let data;
    switch (shape.shape) {
      case 'rect':
        data = this.getRectSVGData(shape, item, options);
        break;

      case 'line':
        data = this.getLineSVGData(shape, item, options);
        break;

      case 'circle':
        data = this.getCircleSVGData(shape, item, options);
        break;

      case 'ellipse':
        data = this.getEllipseSVGData(shape, item, options);
        break;

      case 'polygon':
        data = this.getPolygonSVGData(shape, item, options);
        break;

      case 'path':
        data = this.getPathSVGData(shape, item, options);
        break;

      case 'text':
        data = this.getTextSVGData(shape, item, options);
        break;

      default:
        if (shape.shape !== 'g' && (shape.shape || !shape.shapes)) {
          this.pushNotification(_('Unknown shape: %s in item %s.', shape.shape, item.getElementClass()), 'error');
          throw new Error('Unknown shape: ' + shape.shape);
        }

        const { shape: shape1, shapes, x, y, sx, sy, rotation, rotationCenterX, rotationCenterY, skewX, skewY, ...attributes } = shape;
        attributes.transform = '';

        if (!isNaN(x) || !isNaN(y)) {
          attributes.transform += ` translate(${(x ?? 0)}, ${(y ?? 0)})`;
        }

        if (rotation) {
          let rotate = rotation;
          if (Array.isArray(rotate))
            rotate = rotate.join(' ');
          else
            rotate = `${rotate} ${rotationCenterX || 0} ${rotationCenterY || 0}`;

          attributes.transform += ` rotate(${rotate})`;
        }

        if (!isNaN(sx) || !isNaN(sy)) {
          attributes.transform += ` scale(${sx ?? 1}, ${sy ?? 1})`;
        }

        if (!isNaN(skewX)) {
          attributes.transform += ` skewX(${skewX})`;
        }

        if (!isNaN(skewY)) {
          attributes.transform += ` skewY(${skewY})`;
        }

        data = {
          tag: 'g',
          attributes,
        };
    }

    if (shape.shapes) {
      data.children = shape.shapes.map(childShape => this.getShapeSVGData(childShape, item, options));
    }

    return data;
  }

  getShapeSVG(shape, item, options) {
    const data = this.getShapeSVGData(shape, item, options);
    const svg = this.getShapeSVGFromSVGData(data, options);
    return svg;
  }

  getShapeSVGFromSVGData(svgData, options) {
    options ??= {};
    options.prefix ??= '\n';
    options.tab ??= ' ';

    const classList = [];
    if (svgData.attributes) {
      svgData.attributes?.class && classList.push(svgData.attributes.class);
      svgData.attributes?.className && classList.push(svgData.attributes.className);
      svgData.attributes?.classList && classList.push(...svgData.attributes.classList);

      delete svgData.attributes.class;
      delete svgData.attributes.className;
      delete svgData.attributes.classList;

      if (svgData.attributes.style) {
        svgData.attributes.style = Object.entries(svgData.attributes.style)
          .map(([key, value]) => `${key}: ${value};`)
          .join(' ');
          
      }
    }

    const childOptions = {
      ...options,
      prefix: options.prefix + options.tab,
    };

    const attributePrefix = childOptions.prefix;
    const cData = svgData.cData ?
      attributePrefix + (options.escapeHTML ? escapeHTML(svgData.cData) : svgData.cData)
      : '';

    const svg = options.prefix + `<${svgData.tag}`
      + (classList.length ? attributePrefix + `class="${classList.join(' ')}"` : '')
      + (svgData.attributes && Object.entries(svgData.attributes)
        .map(([key, value]) => `${attributePrefix}${key}="${value}"`)
        .join('') || '')
      + options.prefix + '>'
      + (svgData.children?.length ? svgData.children.map(child => this.getShapeSVGFromSVGData(child, childOptions)).join('') : '')
      + cData
      + options.prefix + `</${svgData.tag}>`;

    return svg;
  }

  getRectData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { x, y, width, height, rx, ry } = shape;

    if (typeof x === 'undefined'
      && typeof width === 'undefined'
    ) {
      x = 0;
      width = item.box.width;
    }

    if (typeof y === 'undefined'
      && typeof height === 'undefined'
    ) {
      y = 0;
      height = item.box.height;
    }
    
    x ??= 0;
    y ??= 0;
    width ??= 0;
    height ??= 0;
    rx ??= 0;
    ry ??= 0;

    return { x, y, width, height, rx, ry, style: { ...style, x: undefined, y: undefined } };
  }

  getRectSVGData(shape, item, options) {
    const { x, y, width, height, rx, ry, style } = this.getRectData(shape, item, options);
    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      x,
      y,
      width,
      height,
      rx,
      ry,
    };

    return {
      tag: 'rect',
      attributes,
    };
  }

  getLineData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { x1, y1, x2, y2 } = shape;

    x1 ??= shape.x1 ?? 0;
    y1 ??= shape.y1 ?? 0;
    x2 ??= shape.x2 ?? item.box.width;
    y2 ??= shape.y2 ?? item.box.height;

    return { x1, y1, x2, y2, style };
  }

  getLineSVGData(shape, item, options) {
    const { x1, y1, x2, y2, style } = this.getLineData(shape, item, options);
    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      x1,
      y1,
      x2,
      y2,
    };

    return {
      tag: 'line',
      attributes,
    };
  }

  getCircleData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { cx, cy, r } = shape;

    cx ??= shape.x ?? 0;
    cy ??= shape.y ?? 0;

    if (typeof cx === 'undefined'
      && typeof r === 'undefined'
    ) {
      cx = item.box.width / 2;
      r = cx;
    }

    if (typeof cy === 'undefined'
      && typeof r === 'undefined'
    ) {
      cy = item.box.height / 2;
      r = cy;
    }

    return { cx, cy, r, r, style: { ...style, x: undefined, y: undefined }};
  }

  getCircleSVGData(shape, item, options) {
    const { cx, cy, r, style } = this.getCircleData(shape, item, options);
    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      cx,
      cy,
      r,
    };

    return {
      tag: 'circle',
      attributes,
    };
  }

  getEllipseData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { cx, cy, rx, ry, r } = shape;

    cx ??= shape.x ?? 0;
    cy ??= shape.y ?? 0;

    if (typeof cx === 'undefined'
      && typeof rx === 'undefined'
    ) {
      cx = item.box.width / 2;
      rx = cx;
    }

    if (typeof cy === 'undefined'
      && typeof ry === 'undefined'
    ) {
      cy = item.box.height / 2;
      ry = cy;
    }
    
    rx ??= r ?? 1;
    ry ??= r ?? 1;

    return { cx, cy, rx, ry, style: { ...style, x: undefined, y: undefined }};
  }

  getEllipseSVGData(shape, item, options) {
    const { cx, cy, rx, ry, style } = this.getEllipseData(shape, item, options);
    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      cx,
      cy,
      rx,
      ry,
    };

    return {
      tag: 'ellipse',
      attributes,
    };
  }

  getItemPos(item, options) {
    const pos = {};
    if (item.position === 'fixed') {
      if ((typeof item.x === 'undefined' || item.x === null) && !isNaN(item.right)) {
        pos.x = Math.min(this.container.offsetWidth + this.container.scrollLeft, this.pixelsWidth) / this.style.sx - item.right;
      } else {
        pos.x = this.container.scrollLeft / this.style.sx + (item.x ?? 0);
      }

      if ((typeof item.y === 'undefined' || item.y === null) && !isNaN(item.bottom)) {
        pos.y = Math.min(this.container.offsetHeight + this.container.scrollTop, this.pixelsHeight) / this.style.sy - item.bottom;
      } else {
        pos.y = this.container.scrollTop / this.style.sy + (item.y ?? 0);
      }
    } else {
      pos.x = item.x;
      if (isNaN(pos.x)) {
        pos.x = getNumber((options?.width ?? this.width) - item.right, 0);
      }

      pos.y = item.y;
      if (isNaN(pos.y)) {
        pos.y = getNumber((options?.height ?? this.height) - item.bottom, 0);
      }
    }

    pos.x += options?.offset?.x ?? 0;
    pos.y += options?.offset?.y ?? 0;

    return pos;
  }

  getPolygonData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { x, y } = shape;

    x = getNumber(x, 0);
    y = getNumber(y, 0);

    return { x, y, points: shape.points, style };
  }

  getPolygonSVGData(shape, item, options) {
    const { x, y, style, ...data } = this.getPolygonData(shape, item, options);
    const points = data.points
      .split(/[\s]+/)
      .map(p => {
        const [x, y] = p.split(',');
        return [ parseFloat(x), parseFloat(y) ].join(',');
      })
      .join(' ');

    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      points,
    };

    return {
      tag: 'polygon',
      attributes,
    };
  }

  getPathData(shape, item, options) {
    const style = this.getStyle({ item, shape, options });
    let { x, y } = shape;

    x = getNumber(x, 0);
    y = getNumber(y, 0);

    return { x, y, d: shape.d, style: { ...style, x, y }};
  }

  getPathSVGData(shape, item, options) {
    const { style, ...data } = this.getPathData(shape, item, options);

    options ??= {};
    options.prefix ??= '\n';
    options.tab ??= ' ';
    const attributePrefix = options.prefix + options.tab;
    const commandsPrefix = attributePrefix + options.tab;
    let d = data.d
      .trim()
      .replace(/"/g, '\'')
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, '')
      .replace(/\s\s+/g, ' ')
      .trim()
      .split('\n')
      .map(line => line.replace(/^\s+/g, '').replace(/\s+$/g, ''))
      .join('\n')
      .replace(/\n/g, commandsPrefix)
      .trim();
    
    const attributes = {
      ...this.getStyleSVGAttributes(style, options),
      d,
    };

    return {
      tag: 'path',
      attributes,
    };
  }

  getTextData(shape, item, style, options) {
    let { x, y, width, height } = shape;
    style ??= this.getStyle({ item, shape, type: 'text', options });

    if (typeof x === 'undefined'
      && typeof width === 'undefined'
    ) {
      x = 0;
      width = item.box?.width ?? 0;
    }

    if (typeof y === 'undefined'
      && typeof height === 'undefined'
    ) {
      y = 0;
      height = item.box?.height ?? 0;
    }

    x ??= 0;
    y ??= 0;
    width = getNumber(width, 0);
    height = getNumber(height, 0);

    let lineSpacing = style.lineSpacing ?? 0,
      lineHeight = (style.fontSize ?? 1) + lineSpacing;
  
    if (style.textAnchor === 'right') {
      x += width - style.margin.right;
    } else if (style.textAnchor === 'start' || style.textAnchor === 'left') {
      x += style.margin.left;
    } else {
      width += style.margin.left + style.margin.right;
      x += width / 2;
    }

    if (style.dominantBaseline === 'bottom') {
      y += height - style.margin.bottom;
    } else if (style.dominantBaseline === 'top') {
      y += style.margin.top;
    } else {
      height += style.margin.top + style.margin.bottom;
      y += (height - ((shape.text.split('\n').length ?? 1) - 1) * lineHeight) / 2;
    }

    if (shape.textDecoration)
      style.textDecoration = shape.textDecoration;

    return {
      x, y, width, height,
      lineSpacing,
      style: { ...style, x: undefined, y: undefined },
    };
  }

  getTextSVGData(shape, item, options) {
    const { x, y, style } = this.getTextData(shape, item, options?.style, options);
    const lines = shape.text.split('\n');
    const commonAttributes = this.getStyleSVGAttributes(style, options);
    const fontAttibutes = this.getFontStyleSVGAttributes(style);
    const attributes = {
      classList: [ ...(style.classList || [])],
      x,
      y,
      ...commonAttributes,
      ...fontAttibutes,
      style: {
        ...commonAttributes.style,
        ...fontAttibutes.style,
      }
    };

    const children = lines.map((line, index) => {
      const dy = index === 0 ? 0 : (style.lineSpacing || style.fontSize || 1.2);
      return {
        tag: 'tspan',
        attributes: { x, dy },
        cData: line,
      };
    });

    return {
      tag: 'text',
      attributes,
      children,
    };
  }

  getConnectorsSVG(node, options) {
    if (!node.connectors?.length)
      return;

    const connectorSVG = node.connectors.map(connector => this.getConnectorSVG(connector, node, options))
      .join('');

    return options.prefix + '<g'
        + options.prefix + 'class="actdia-connectors"'
      + options.prefix + '>'
        + connectorSVG
      + options.prefix + '</g>';
  }

  getConnectorShapeData(connector, node, options) {
    const style = this.getStyle({ item: node, shape: { ...connector, rotation: -connector.direction }, type: connector.type || 'connector', options });
    let shape = connector.shape ?? style.shape;

    if (!shape) {
      console.log(connector);
      this.pushNotification(_('No shape defined for connector in item %s.', node.getElementClass()), 'error');
      return;
    }

    shape = {
      className: 'actdia-connector',
      name: connector.name,
      type: connector.type,
      x: connector.x,
      y: connector.y,
      id: connector.id,
      rotation: -connector.direction,
      shapes: [...shape.shapes],
    };

    if (connector.label) {
      let text = connector.label;
      if (text === true) {
        text = connector.name.toUpperCase();
        if (text[0] === '!') {
          text = text.substring(1);
          connector.textDecoration = 'overline';
        }
      }

      if (text) {
        const textShape = {
          shape: 'text',
          text,
          x: connector.labelOffsetX || 0,
          y: connector.labelOffsetY || 0,
          sx: 0.7,
          sy: 0.7,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          rotation: connector.direction,
        };

        if (connector.textDecoration)
          textShape.textDecoration = connector.textDecoration;

        if (connector.direction === 0) {
          textShape.width = 0;
          textShape.textAnchor = 'right';
          textShape.margin = { right: .5 + (connector.margin || 0) };
        } else if (connector.direction === DIRECTIONS.LEFT) {
          textShape.width = 0;
          textShape.textAnchor = 'left';
          textShape.margin = { left: .5 + (connector.margin || 0) };
        } else if (connector.direction === DIRECTIONS.UP) {
          textShape.height = 0;
          textShape.dominantBaseline = 'top';
          textShape.margin = { top: .4 + (connector.margin || 0) };
        } else if (connector.direction === DIRECTIONS.DOWN) {
          textShape.height = 0;
          textShape.dominantBaseline = 'bottom';
          textShape.margin = { bottom: .4 + (connector.margin || 0) };
        }

        shape.shapes.push(textShape);
      }
    }

    return {
      shape,
      style: {
        sx: style.sx,
        sy: style.sy,
      },
    };
  }

  getConnectorSVG(connector, node, options) {
    const data = this.getConnectorShapeData(connector, node, options);
    if (!data)
      return;
    
    const shapeOptions = {
      offset: {
        x: connector.x,
        y: connector.y,
      },
      ...options,
      bounding: {
        connector,
        ...options?.bounding,
      },
      classList: [
        options?.className,
        ...(options.classList || []),
      ].filter(c => c),
      prefix: options.prefix + options.tab,
      sx: data.style.sx,
      sy: data.style.sy,
    };

    const shape = { ...data.shape, shapes: [ ...(data.shape.shapes || []) ] };
    const shapeSVG = this.getShapeSVG(
      shape,
      node,
      shapeOptions,
    );

    return shapeSVG;
  }

  getSelectedData(item, options) {
    let { x, y, width, height } = item.box ?? { x: 0, y: 0, width: 0, height: 0 };
    if (!width || !height)
      return;
    
    const style = { ...this.style.item, ...this.style.selectedItem, ...item };

    x ??= 0;
    y ??= 0;
    x -= style.offset;
    y -= style.offset;

    width += style.offset * 2;
    height += style.offset * 2;

    return { x, y, width, height, style };
  }

  getSelectedRectSVG(item, options) {
    const data = this.getSelectedData(item, options);
    if (!data)
      return;

    const { x, y, width, height } = data;
    const attributePrefix = options.prefix + options.tab;
    return options.prefix + '<rect'
        + attributePrefix + `class="actdia-selection-box"`
        + attributePrefix + `x="${x}"`
        + attributePrefix + `y="${y}"`
        + attributePrefix + `width="${width}"`
        + attributePrefix + `height="${height}"`
      + options.prefix + '/>';
  }

  tryUpdateShape(item, svgElement, shape) {
    if (!svgElement) {
      return false;
    }

    try {
      this.updateShape(item, svgElement, shape);
      return true;
    } catch {}
    
    return false;
  }

  updateShape(item, svgElement, shape) {
    const data = this.getShapeSVGData(shape, item);
    this.updateSVGElementFromData(svgElement, data, item)
      || (svgElement.outerHTML = this.getShapeSVG(shape, item));
  }

  updateSVGElementFromData(svgElement, data, options) {
    if (!data)
      return;

    if (!svgElement) {
      if (!options.parent)
        return;

      svgElement = document.createElementNS('http://www.w3.org/2000/svg', data.tag);
      options.parent.appendChild(svgElement);
    } else if (svgElement.tagName.toLowerCase() !== data.tag.toLowerCase()) {
      return false;
    }

    const classList = [];
    if (data.attributes) {
      data.attributes?.class && classList.push(data.attributes.class);
      data.attributes?.className && classList.push(data.attributes.className);
      data.attributes?.classList && classList.push(...data.attributes.classList);

      delete data.attributes.className;
      delete data.attributes.classList;

      if (data.attributes.style) {
        data.attributes.style = Object.entries(data.attributes.style)
          .map(([key, value]) => `${key}: ${value};`)
          .join(' ');
      }

      data.attributes.class = classList.join(' ');
    }
    
    Object.entries(data.attributes).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        svgElement.removeAttribute(key);
      } else if (svgElement.getAttribute(key) != value) {
        svgElement.setAttribute(key, value);
      }
    });

    if (data.cData) {
      if (svgElement.textContent !== data.cData)
        svgElement.textContent = data.cData;
    }

    if (data.children?.length) {
      data.children.forEach((childData, index) => {
        this.updateSVGElementFromData(svgElement.children[index], childData, { parent: svgElement });
      });
    }

    return true;
  }

  updateItem(item) {
    this.tryUpdateShape(item, item.svgShape, this.getItemMainShape(item));
    this.tryUpdateConnectors(item);
    if (item.svgSelectionBox?.setAttribute) {
      const data = this.getSelectedData(item);
      item.svgSelectionBox.setAttribute('x', data.x);
      item.svgSelectionBox.setAttribute('y', data.y);
      item.svgSelectionBox.setAttribute('width', data.width);
      item.svgSelectionBox.setAttribute('height', data.height);
    }
  }

  tryUpdateConnectors(item) {
    if (!(item.svgConnectors instanceof SVGElement))
      return;

    item.connectors.forEach(connector => {
      const svgConnector = item.svgConnectors.querySelector(`g.actdia-connector#${CSS.escape(connector.id)}`);
      const data = this.getConnectorShapeData(connector, item);
      if (svgConnector) {
        this.updateShape(item, svgConnector, data.shape);
      } else {
        const svg = this.getShapeSVG(data.shape, item);
        item.svgConnectors.innerHTML += svg;
      }
    });

    const svgConnectorsList = item.svgConnectors.querySelectorAll(`g.actdia-connector`);
    [...svgConnectorsList].forEach(svgConnector => {
      const connector = item.connectors.find(c => c.id === svgConnector.id);
      if (!connector) {
        svgConnector.remove();
      }
    });
  }

  showLabel(text) {
    this.label.innerHTML = text;
    this.label.style.whiteSpace = 'nowrap';
    this.label.style.display = 'block';
    this.updateLabelPosition();
  }

  updateLabelPosition() {
    if (this.label.style.display !== 'none') {
      const x = Math.min(this.pixelsWidth - this.label.offsetWidth - 10, this.mouse.x + 10);
      const y = Math.min(this.pixelsHeight - this.label.offsetHeight - 10, this.mouse.y + 10);
      this.label.style.left = x + 'px';
      this.label.style.top = y + 'px';
    }
  }

  hideLabel() {
    this.label.style.display = 'none';
  }

  startDrag(...items) {
    this.hideLabel();
    this.dragging ??= {
      start: { x: this.mouse.x, y: this.mouse.y },
      items: items
        .filter(item => item?.draggable !== false)
        .map(item => {
          const from = {};
          if (isItem(item)) {
            from.x = item.x;
            from.y = item.y;
          } else if (isHTMLElement(item)) {
            from.x = parseFloat(getComputedStyle(item).left);
            from.y = parseFloat(getComputedStyle(item).top);
          }
          return { item, from };
        }),
    };
  }

  endDrag() {
    if (this.dragging) {
        if (this.dragging.items?.length) {
          this.fireEvent('items:moved', { items: this.dragging.items });
          this.fireEvent('diagramchanged');
        }

      this.dragging = null;
    }
  }

  cancelCaptureItem() {
    if (this.capturedItem) {
      this.deleteItem(this.capturedItem);
      this.capturedItem = null;
    }
  }

  cancelDrag() {
    if (this.dragging) {
      if (this.dragging.items?.length) {
        this.dragging.items.forEach(item => item.item.moveTo(item.from));
      }

      this.dragging = null;
    }
  }

  startSelectionBox() {
    this.endSelectionBox();

    const pos = this.getUntransformedPosition(this.mouse);
    this.selectionBox ??= {
      from: { ...pos },
      to: { ...pos },
      start: { x: this.mouse.x, y: this.mouse.y },
      end: { x: this.mouse.x, y: this.mouse.y },
      type: 'rect',
      previousSelectedItems: this.#items.filter(i => i.selected),
    };

    this.selectionBox.svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.selectionBox.svg.classList.add('selection-box');
    this.othersLayerSVG.appendChild(this.selectionBox.svg);

    this.selectionBox.svg.setAttribute('x', pos.x);
    this.selectionBox.svg.setAttribute('y', pos.y);
    this.selectionBox.svg.setAttribute('width', 0);
    this.selectionBox.svg.setAttribute('height', 0);
  }

  endSelectionBox() {
    if (this.selectionBox?.svg) {
      this.selectionBox.svg.remove();
      this.selectionBox = null;
    }
  }

  updateSelectionBox() {
    if (!this.selectionBox) {
      return;
    }

    const pos = this.getUntransformedPosition(this.mouse, { snap: false });
    this.selectionBox.end = { x: this.mouse.x, y: this.mouse.y };
    this.selectionBox.to = { ...pos };
    this.selectionBox.x = Math.min(this.selectionBox.from.x, this.selectionBox.to.x);
    this.selectionBox.y = Math.min(this.selectionBox.from.y, this.selectionBox.to.y);
    this.selectionBox.u = Math.max(this.selectionBox.from.x, this.selectionBox.to.x);
    this.selectionBox.v = Math.max(this.selectionBox.from.y, this.selectionBox.to.y);
    this.selectionBox.width = this.selectionBox.u - this.selectionBox.x;
    this.selectionBox.height = this.selectionBox.v - this.selectionBox.y;

    this.selectionBox.svg.setAttribute('x', this.selectionBox.x);
    this.selectionBox.svg.setAttribute('y', this.selectionBox.y);
    this.selectionBox.svg.setAttribute('width', this.selectionBox.width);
    this.selectionBox.svg.setAttribute('height', this.selectionBox.height);

    const inSelectionBox = this.#items.filter(item =>
        item.x + item.box.width >= this.selectionBox.x &&
        item.x <= this.selectionBox.u &&
        item.y + item.box.height >= this.selectionBox.y &&
        item.y <= this.selectionBox.v
    );

    this.#items.forEach(item => {
      item.selected =
        this.selectionBox.previousSelectedItems.includes(item)
        || inSelectionBox.includes(item)
        || isConnection(item)
          && inSelectionBox.includes(item.from.item)
          && inSelectionBox.includes(item.to.item);
    });
  }

  getShapeByKeyValue(shapes, key, value) {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape[key] === value) {
        return shape;
      } else if (shape.shapes?.length) {
        const found = this.getShapeByKeyValue(shape.shapes, key, value);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  getEventItem(evt) {
    if (!evt.target instanceof SVGElement) {
      return {};
    }

    const shapeSVG = evt.target;
    const result = { shapeSVG };
    const svgItem = evt.target.closest('g.actdia-item');
    if (!svgItem)
      return result;

    result.svgItem = svgItem;
    const item = this.#items.find(i => i.id === svgItem.id);
    result.item = item;

    let shape;
    const attributes = shapeSVG.attributes;
    const id = attributes?.id?.value;
    if (id) {
      if (item?.shape?.id === id) {
        shape = item.shape;
      } else if (item.shape.shapes?.length) {
        shape = this.getShapeByKeyValue(item.shape.shapes, 'id', id);
      }
    }
    
    if (!shape) {
      const name = attributes?.name?.value;
      if (name && item?.shape) {
        if (item.shape.name === name) {
          shape = item.shape;
        } else if (item.shape.shapes?.length) {
          shape = this.getShapeByKeyValue(item.shape.shapes, 'name', name);
        }
      }
    }

    result.shape = shape;
    return result;
  }

  getEventItemConnector(evt) {
    const result = this.getEventItem(evt);
    if (!result.item?.connectors?.length)
      return result;

    let svgConnector = evt.target.closest('g.actdia-connector');
    if (!svgConnector)
      return result;

    result.connector = result.item.connectors.find(c => c.id === svgConnector.id);
    return result;
  }

  getUntransformedPosition(position, options = {}) {
    if (!position)
      return null;

    let
      x = position.x / this.style.sx,
      y = position.y / this.style.sy;
    
    if (options.snap || (options.snap !== false && this.style.snap)) {
      x = Math.round(x);
      y = Math.round(y);
    }

    return { x, y };
  }

  fireEvent(type, detail = {}) {
    const event = new CustomEvent(
      type,
      {
        detail: {
          actdia: this,
          ...detail,
        },
        bubbles: true,
        cancelable: true,
      }
    );
    
    this.svg.dispatchEvent(event);
  }

  mouseMoveHandler(evt) {
    const rect = this.svg.getBoundingClientRect();
    this.mouse.x = evt.clientX - rect.left;
    this.mouse.y = evt.clientY - rect.top;
    this.updateLabelPosition();

    if (this.dragging?.items?.length) {
      evt.preventDefault();
      let
        ix = this.mouse.x - this.dragging.start.x,
        iy = this.mouse.y - this.dragging.start.y;
      const dd = this.getUntransformedPosition({ x: ix, y: iy });

      this.dragging.items.forEach(dragging => {
        const item = dragging.item;
        if (isItem(item)) {
          const to = {
            x: dragging.from.x + dd.x,
            y: dragging.from.y + dd.y,
          };
          item.moveTo(to);
        } else if (isHTMLElement(item)) {
          this.pushNotification(_('Check this out...'), 'debug');
          item.style.left = dragging.from.x + ix + 'px';
          item.style.top = dragging.from.y + iy + 'px';
        } else {
          this.pushNotification(_('Check this out...'), 'debug');
        }
      });

      return;
    }
    
    if (this.capturedItem) {
      this.capturedItem.update({
        mouse: {
          ...this.mouse,
          x: this.mouse.x / this.style.sx,
          y: this.mouse.y / this.style.sy,
        }
      });

      const { connector } = this.getEventItemConnector(evt);
      if (connector) {
        if (this.capturedItem.from.connector?.accepts?.includes(connector.type)) {
          this.showLabel(_('Connector: %s<br>Status: %s<br>Click to connect', connector.name, connector.getStatusText()));
        } else {
          this.showLabel(_('The connector "%s" does not accept connections of type: "%s".', connector.type, this.capturedItem.from.connector.type));
        }
      }
      
      return;
    }

    const { item, shape } = this.getEventItem(evt);
    item?.onMouseMove?.({
      evt,
      item,
      shape,
      mouse: this.getUntransformedPosition(this.mouse, { snap: false }),
    });

    if (evt.defaultPrevented)
      return false;

    this.updateSelectionBox();
  }

  mouseOverHandler(evt) {
    if (!this.dragging && !this.capturedItem) {
      let { item, connector } = this.getEventItemConnector(evt);
      if (this.editable) {
        if (connector) {
          this.showLabel(_('Connector: %s<br>Status: %s<br>Click to connect', connector.name, connector.getStatusText()));
          return;
        }
      }

      this.showLabelForItem(item);
    }
  }

  showLabelForItem(item) {
    if (!item)
      return;

    this.showLabel(
      (item.name || item.description || item.id || item.constructor.name)
      + '<br>' + _(`Status: %s`, item.getStatusText()),
    );
  }

  mouseOutHandler(evt) {
    this.hideLabel();
  }

  clickHandler(evt) {
    if (!this.editable)
      return;

    const { item, shape, connector } = this.getEventItemConnector(evt);
    if (!item) {
      return;
    }

    if (connector) {
      this.connectorClickHandler({ evt, item, connector });
      return;
    }

    if (this.capturedItem) {
      this.cancelCaptureItem();
      return;
    }

    if (item.onClick) {
      if (item.onClick({ evt, item, shape }) === false)
        evt.preventDefault();

      if (evt.defaultPrevented)
        return;
    }

    if (item.handleClick) {
      if (item.handleClick({ evt, item, shape }) === false)
        evt.preventDefault();

      if (evt.defaultPrevented)
        return;
    }

    if (item && item.selectable !== false && evt.button === 0 && item !== this.capturedItem) {
      if (evt.ctrlKey) {
        item.select(!item.selected);
        return true;
      } else {
        this.#items.forEach(i => i.select(i === item));
      }
    }
  }

  connectorClickHandler({ evt, item, connector }) {
    if (!this.editable || !item || !connector) {
      return true;
    }

    if (evt.button !== 0) {
      this.cancelCaptureItem();
      return;
    }
    
    if (this.capturedItem
      && this.capturedItem.to === 'mouse'
    ) {
      if (!this.capturedItem.from.connector?.accepts.includes(connector.type)) {
        this.pushNotification(_('The connector "%s" does not accept connections of type: "%s".', connector.type, this.capturedItem.from.connector.type));
        return true;
      }

      if (this.capturedItem.from.connector.type === 'out') {
        if (connector.type !== 'in') {
          return true;
        }
      } else if (this.capturedItem.from.connector.type === 'in') {
        if (connector.type !== 'out') {
          return true;
        }
      } else if (!this.capturedItem.from.connector?.accepts.includes(connector.type)) {
        return true;
      }

      this.capturedItem.setTo({ item, connector });
      this.capturedItem.update();
      this.capturedItem = null;

      this.hideLabel();

      return false;
    }  

    (async () => {
      this.capturedItem = await this.addItem({
        elementClass: 'Connection',
        url: './connection.js',
        from: {
          item,
          connector,
        },
        to: 'mouse'
      });
      this.capturedItem.update({
        mouse: {
          ...this.mouse,
          x: this.mouse.x / this.style.sx,
          y: this.mouse.y / this.style.sy,
        }
      });
    })();

    this.hideLabel();
    
    return false;
  }

  dblClickHandler(evt) {
    const { item } = this.getEventItem(evt);
    if (item) {
      const event = new CustomEvent(
        'item:dblclick',
        {
          detail: {
            item,
            mouse: this.mouse,
          },
          bubbles: true,
          cancelable: true,
        }
      );
      const original = event.stopPropagation;
      event.stopPropagation = () => {
        event._stopped = true;
        evt.stopImmediatePropagation();
        return original.call(event);
      };
      this.svg.dispatchEvent(event);

      if (event.defaultPrevented)
        evt.preventDefault();
    }
  }

  contextMenuHandler(evt) {
    if (this.capturedItem) {
      this.cancelCaptureItem();
      evt.preventDefault();
    }

    if (this.dragging) {
      this.cancelDrag();
      evt.preventDefault();
    }
  }

  mouseDownHandler(evt) {
    this.mouse.down = {
      x: this.mouse.x,
      y: this.mouse.y,
      button: evt.button,
      time: Date.now(),
    };

    if (this.dragging) {
      this.cancelDrag();
    }

    if (evt.button !== 0) {
      if (this.capturedItem) {
        this.cancelCaptureItem();
      }
    }

    const { item, shape } = this.getEventItem(evt);
    if (item) {
      this.itemMouseDownHandler(evt, item, shape);
      if (evt.defaultPrevented) {
        return;
      }
    }
      this.#items.forEach(i => i.select(false));

    this.startSelectionBox();
  }

  itemMouseDownHandler(evt, item, shape) {
    if (!item) {
      return true;
    }

    item.onMouseDown?.({
      evt,
      item,
      shape,    
      mouse: this.getUntransformedPosition(this.mouse, { snap: false }),
    });

    if (evt.defaultPrevented) {
      return;
    }

    if (evt.button !== 0) {
      this.endDrag();
      return;
    }
    
    if (evt.ctrlKey) {
      this.startDrag(...this.#items.filter(i => i.selected && i.draggable !== false));
    } else {
      if (item.draggable !== false) {
        if (item.selected) {
          this.startDrag(...this.#items.filter(i => i.selected && i.draggable !== false));
        } else {
          this.startDrag(item);
        }
      }
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  mouseUpHandler(evt) {
    this.endSelectionBox();

    const { item, shape } = this.getEventItem(evt);
    item?.onMouseUp?.({
      evt,
      item,
      shape, 
      mouse: this.getUntransformedPosition(this.mouse, { snap: false }),
    });

    if (evt.defaultPrevented)
      return false;

    if (this.dragging) {
      this.mouse.down = null;
      this.endDrag();

      evt.stopPropagation();
      evt.preventDefault();
    }
  }
}