import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import MDParser from '../utils/md-parser.js';
import { _, addLocaleUrl, onLanguageLoaded } from '../locale/locale.js';

importCss('./md-viewer.css', import.meta.url);

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

const renderMetadataOptions = {
  items: [
    {
      key: 'title',
      _label: 'Title',
      label: 'Title',
      showLabel: false,
      tag: 'h1',
    },
    {
      key: 'author',
      _label: 'Author',
      label: 'Author',
    },
    {
      key: 'date',
      _label: 'Date',
      label: 'Date',
    },
    {
      key: 'lang',
      _label: 'Language',
      label: 'Language',
    },
    {
      key: 'abstract',
      _label: 'Summary',
      label: 'Summary',
      valueTag: 'p',
    },
  ],
  restItems: true,
};

onLanguageLoaded(() => {
  renderMetadataOptions.items.forEach(item => {
    item.label = _(item._label);
  });
});

export default class MDViewer extends Base {
  #md = '';
  #doc = null;
  #mdParser = new MDParser();
  #nodeRenderers = {
    'document': this.renderDocument.bind(this),
    'text': this.renderText.bind(this),
    'data': this.renderData.bind(this),
    'heading': this.renderHeading.bind(this),
    'rule': this.renderRule.bind(this),
    'paragraph': this.renderParagraph.bind(this),
    'strong': this.renderStrong.bind(this),
    'em': this.renderEmphasis.bind(this),
    'strong-italic': this.renderStrongItalic.bind(this),
    'mark': this.renderMark.bind(this),
    'sub': this.renderSubscript.bind(this),
    'sup': this.renderSuperscript.bind(this),
    'command': this.renderCommand.bind(this),
    'list': this.renderList.bind(this),
    'list-item': this.renderListItem.bind(this),
    'ref': this.renderReference.bind(this),
    'link': this.renderLink.bind(this),
    'image': this.renderImage.bind(this),
    'footnote': this.renderFootnote.bind(this),
    'definition': this.renderDefinition.bind(this),
    'code': this.renderCode.bind(this),
    'code-block': this.renderCodeBlock.bind(this),
    'blockquote': this.renderBlockquote.bind(this),
    'custom-block': this.renderCustomBlock.bind(this),
    'table': this.renderTable.bind(this),
    'table-head': this.renderTableHead.bind(this),
    'table-foot': this.renderTableFoot.bind(this),
    'table-body': this.renderTableBody.bind(this),
    'table-row': this.renderTableRow.bind(this),
    'table-cell': this.renderTableCell.bind(this),
  };

  constructor(options) {
    super();
    this.create(options);

    this.addPlugins(options?.plugins);
  }

  create(options) {
    super.create({ ...options, defaultParentElement: document.body });

    this.element ??= document.createElement('div');

    this.element.classList.add('md-viewer');
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }

  addPlugins(plugins) {
    for (const plugin of plugins) {
      this.addPlugin(plugin);
    }
  }

  addPlugin(plugin) {
    if (!plugin)
      return;

    if (plugin.parsers) {
      this.#mdParser.addPlugins(plugin.parsers);
    }

    if (plugin?.renderers) {
      this.addRenderers(plugin.renderers);
    }
  }

  addRenderers(renderers) {
    for (const renderer of renderers) {
      this.addRenderer(renderer);
    }
  }

  addRenderer(renderer) {
    this.#nodeRenderers[renderer.name] = (node, parentElement) => renderer.renderer({ md: this, node, parentElement });
  }

  get md() {
    return this.#md;
  }

  set md(md) {
    this.#md = md;
    this.#doc = this.#mdParser.parse(md);
    this.render();

    // console.log(this.#doc);
  }

  render() {
    this.renderNode(this.#doc.metadata, this.element, renderMetadataOptions);
    this.renderNode(this.#doc, this.element);
  }

  renderError(message, parentElement) {
    if (!message || !parentElement)
      return;

    console.error(message);

    let errorElement = document.createElement('div');
    errorElement.classList.add('error');
    errorElement.textContent = message;
    parentElement.appendChild(errorElement);
  }

  checkNodeAndParent(node, parentElement, type) {
    if (!parentElement)
      throw new Error(_('The parent element is null or undefined.'));
    
    if (!node)
      this.renderError(_('The node is null or undefined.'), parentElement);

    if (type && node?.type !== type)
      this.renderError(_('The type of the received node "%s" is not the expected: %s.', node?.type, type), parentElement);

    return true;
  }

  renderNode(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement))
      return;

    const renderer = this.#nodeRenderers[node.type];
    if (!renderer) {
      this.renderError(_('Unknown element type: "%s"', node.type), parentElement);
      return;
    }

    const element = renderer(node, parentElement, options);

    if (element) {
      node.element = element;
      element.mdNode = node;
    }

    return element;
  }

  renderContent(content, parentElement, options) {
    return this.renderNodes(content, parentElement, options);
  }

  renderNodes(nodes, parentElement, options) {
    if (!parentElement)
      throw new Error(_('The parent element is null or undefined.'));
    
    if (!nodes)
      throw new Error(_('The content of the nodes is null or undefined.'));

    if (!Array.isArray(nodes)) {
      return this.renderNode(nodes, parentElement, options);
    }
    
    if (!nodes?.length)
      return;

    const elements = [];
    for (const node of nodes)
      elements.push(this.renderNode(node, parentElement, options));

    return elements;
  }

  renderText(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'text'))
      return;

    let textNode = document.createTextNode(node.text);
    parentElement.appendChild(textNode);

    return textNode;
  }

  renderData(node, parentElement, options) {
    if (!node || !parentElement)
      return;

    const element = document.createElement('div');
    parentElement.appendChild(element);
    element.classList.add('data');
    if (options.className)
      element.classList.add(options.className);

    if (node.beginLine)
      this.renderRule({ type: 'rule' }, element);

    const items = options?.items || [],
      data = node.data;

    if (!items.length || options?.restItems !== false) {
      for (const [key, value] of Object.entries(node.data)) {
        if (!items.some(item => item.key === key)) {
          items.push({ key });
        }
      }  
    }

    for (const item of items) {
      const [key, value] = Object.entries(data).find(([k]) => k === item.key) || [];

      const tag = item.tag || 'div';
      const itemElement = document.createElement(tag);
      itemElement.classList.add('item');
      element.appendChild(itemElement);

      if (item.showLabel !== false) {
        const keyTag = item.keyTag || 'span';
        const keyElement = document.createElement(keyTag);
        keyElement.classList.add('key');
        keyElement.textContent = (item.label || key) + ': ';
        itemElement.appendChild(keyElement);
      }

      const valueTag = item.valueTag || 'span';
      const valueElement = document.createElement(valueTag);
      valueElement.classList.add('value');
      valueElement.textContent = value;
      itemElement.appendChild(valueElement);
    }

    if (node.endLine)
      this.renderRule({ type: 'rule' }, element);

    return element;
  }

  renderDocument(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'document'))
      return;

    const docElement = document.createElement('div');
    docElement.classList.add('document');
    parentElement.appendChild(docElement);
    this.renderContent(node.content, docElement);

    return docElement;
  }

  renderHeading(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'heading'))
      return;

    let headingElement = document.createElement(`h${node.level}`);
    this.renderContent(node.content, headingElement);
    parentElement.appendChild(headingElement);


    return headingElement;
  }

  renderRule(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'rule'))
      return;

    const ruleElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    parentElement.appendChild(ruleElement);
    ruleElement.classList.add('rule');
    if (node.variant)
      ruleElement.classList.add(node.variant);

    let count = node.count || (node.variant === 'triple' ? 3 :
      node.variant === 'double' ? 2 :
      1);

    let width = parseInt(node.width) || 1,
      gap = parseInt(node.gap) || width,
      dasharray = '',
      x = 0;
    if (node.pattern) {
      let 
        pattern = node.pattern,
        dash = width * 7,
        space = width * 4,
        dot = width > 1 ? 0 : 1,
        dashItems = [];

      const items = [...pattern.matchAll(/(.)\1*/g)];
      if (items.length === 1 && items[0][0] === '.') {
        dashItems.push(dot);
        dashItems.push(space);
        dasharray = dashItems.join(',');
        x = width / 2;
      } else if (items.length > 1) {
        let prior = ' ';
        for (const i in items) {
          const item = items[i];
          const char = item[0][0];
          let repeatCount = item[0].length;

          if (char === '.') {
            if (prior !== ' ')
              dashItems.push(space);

            for (let i = 0; i < repeatCount - 1; i++) {
              dashItems.push(dot);
              dashItems.push(space);
            }
            dashItems.push(dot);
          } else if (char === '-') {
            if (prior !== ' ')
              dashItems.push(space);

            dashItems.push(repeatCount * dash);
          } else {
            if (prior === '.' || items[parseInt(i) + 1]?.[0][0] === '.')
              repeatCount++;

            dashItems.push(repeatCount * space);
          }

          prior = char;
        }

        if (dashItems.length % 2)
          dashItems.push(space);

        if (dashItems[0] === 0)
          x = width / 2;

        dasharray = dashItems.join(',');
      }
    }

    ruleElement.setAttribute('height', width * count + gap * (count - 1));
    let y = width / 2;

    let color = node.color || 'currentColor';

    for (let i = 0; i < count; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ruleElement.appendChild(line);
      line.setAttribute('x1', x);
      line.setAttribute('y1', y);
      line.setAttribute('x2', '100%');
      line.setAttribute('y2', y);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', width);
      line.setAttribute('stroke-linecap', 'round');
      if (dasharray)
        line.setAttribute('stroke-dasharray', dasharray);

      y += width + gap;
    }

    return ruleElement;
  }

  renderParagraph(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'paragraph'))
      return;

    let paragraphElement = document.createElement('p');
    this.renderContent(node.content, paragraphElement);
    parentElement.appendChild(paragraphElement);

    return paragraphElement;
  }

  renderStrong(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'strong'))
      return;

    let strongElement = document.createElement('strong');
    this.renderContent(node.content, strongElement);
    parentElement.appendChild(strongElement);

    return strongElement;
  }

  renderEmphasis(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'em'))
      return;

    let emElement = document.createElement('em');
    this.renderContent(node.content, emElement);
    parentElement.appendChild(emElement);

    return emElement;
  }

  renderStrongItalic(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'strong-italic'))
      return;

    const strongItalicElement = document.createElement('strong');
    const emElement = document.createElement('em');
    this.renderContent(node.content, emElement);
    strongItalicElement.appendChild(emElement);
    parentElement.appendChild(strongItalicElement);

    return strongItalicElement;
  }

  renderMark(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'mark'))
      return;

    let markElement = document.createElement('mark');
    this.renderContent(node.content, markElement);
    parentElement.appendChild(markElement);

    return markElement;
  }

  renderSubscript(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'sub'))
      return;

    let subElement = document.createElement('sub');
    this.renderContent(node.content, subElement);
    parentElement.appendChild(subElement);

    return subElement;
  }

  renderSuperscript(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'sup'))
      return;

    let supElement = document.createElement('sup');
    this.renderContent(node.content, supElement);
    parentElement.appendChild(supElement);

    return supElement;
  }

  #commands = {
    'sum': '&sum;',
    'int': '&int;',
    'sqrt': '&radic;',
    'infty': '&infin;',
    'pi': '&pi;',
  };
  renderCommand(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'command'))
      return;

    let commandElement = document.createElement('span');
    commandElement.classList.add('command');
    commandElement.innerHTML = this.#commands[node.command] || node.command;
    parentElement.appendChild(commandElement);

    return commandElement;
  }

  renderList(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'list'))
      return;

    let listElement = document.createElement(node.ordered ? 'ol' : 'ul');
    parentElement.appendChild(listElement);
    if (node.listType)
      listElement.classList.add(node.listType);
    this.renderContent(node.content, listElement, { listType: node.listType, ordered: node.ordered });

    return listElement;
  }

  renderListItem(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'list-item'))
      return;

    const listItemElement = document.createElement('li');

    if (options.listType === 'task') {
      const id = Math.random().toString(36).slice(2, 16);
      const checkerItem = document.createElement('input');
      listItemElement.appendChild(checkerItem);
      checkerItem.id = id;
      checkerItem.type = 'checkbox';
      if (node.checked)
        checkerItem.checked = true;

      const labelItem = document.createElement('label');
      listItemElement.appendChild(labelItem);
      labelItem.setAttribute('for', id);
      this.renderContent(node.content, labelItem);
    } else {
      this.renderContent(node.content, listItemElement);
    }

    parentElement.appendChild(listItemElement);

    return listItemElement;
  }

  renderReference(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'ref'))
      return;

    let refElement = document.createElement('span');
    refElement.classList.add('reference');
    parentElement.appendChild(refElement);
    if (node.label) {
      refElement.innerHTML = node.label;
    } else {
      refElement.innerHTML = node.refType === 'footnote' ? `[^${node.target}]` : `[@${node.target}]`;
    }

    return refElement;
  }

  renderLink(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'link'))
      return;

    let linkElement = document.createElement('a');
    linkElement.href = node.target;
    if (node.title)
      linkElement.title = node.title;

    this.renderContent(node.content, linkElement);
    parentElement.appendChild(linkElement);

    return linkElement;
  }

  renderImage(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'image'))
      return;

    let imageElement = document.createElement('img');
    imageElement.src = node.target;
    if (node.label)
      imageElement.alt = node.label;
    if (node.title)
      imageElement.title = node.title;
    parentElement.appendChild(imageElement);

    return imageElement;
  }

  renderFootnote(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'footnote'))
      return;

    let footnoteElement = document.createElement('span');
    footnoteElement.classList.add('footnote');
    footnoteElement.innerHTML = `[^${node.id}]`;
    parentElement.appendChild(footnoteElement);
    this.renderContent(node.content, footnoteElement);

    return footnoteElement;
  }

  renderDefinition(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'definition'))
      return;

    let defElement;
    if (parentElement.lastChild?.tagName === 'DL') {
      defElement = parentElement.lastChild;
    } else {
      defElement = document.createElement('dl');
      parentElement.appendChild(defElement);
    }

    const dtElement = document.createElement('dt');
    defElement.appendChild(dtElement);
    this.renderNodes(node.term, dtElement);
    
    for (const definition of node.definitions) {
      const ddElement = document.createElement('dd');
      defElement.appendChild(ddElement);
      this.renderNodes(definition, ddElement);
    }

    return defElement;
  }

  renderCode(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'code'))
      return;
    
    let preElement = document.createElement('pre');
    preElement.classList.add('code', 'inline');

    let codeElement = document.createElement('code');
    codeElement.classList.add(`language-${node.lang || 'plaintext'}`);
    codeElement.textContent = node.code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeElement.dataset.attrs = node.attrs || '';

    preElement.appendChild(codeElement);
    parentElement.appendChild(preElement);

    return preElement;
  }

  renderCodeBlock(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'code-block'))
      return;
    
    let preElement = document.createElement('pre');
    let codeElement = document.createElement('code');
    codeElement.classList.add('block');
    codeElement.classList.add(`language-${node.lang || 'plaintext'}`);
    codeElement.textContent = node.code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeElement.dataset.attrs = node.attrs || '';

    preElement.appendChild(codeElement);
    parentElement.appendChild(preElement);

    return preElement;
  }

  renderBlockquote(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'blockquote'))
      return;

    let blockquoteElement = document.createElement('blockquote');
    this.renderContent(node.content, blockquoteElement);
    parentElement.appendChild(blockquoteElement);

    return blockquoteElement;
  }

  renderCustomBlock(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'custom-block'))
      return;

    const customBlockElement = document.createElement('div');
    customBlockElement.classList.add('custom-block');
    
    if (node.variant)
      customBlockElement.classList.add(node.variant);
    
    if (node.attrs) {
      for (const [key, value] of Object.entries(node.attrs)) {
        if (key === 'class' || key === 'className') {
          let className = [...value.split(/\s+/)].filter(Boolean);
          customBlockElement.classList.add(...className);
        } else {
          customBlockElement.setAttribute(key, value);
        }
      }
    }

    this.renderContent(node.content, customBlockElement);
    parentElement.appendChild(customBlockElement);

    return customBlockElement;
  }

  renderTable(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table'))
      return;

    let tableElement = document.createElement('table');
    if (node.attrs) {
      for (const [key, value] of Object.entries(node.attrs)) {
        tableElement.setAttribute(key, value);
      }
    }

    if (node.head)
      this.renderContent(node.head, tableElement, { table: node });

    if (node.foot)
      this.renderContent(node.foot, tableElement, { table: node });

    this.renderContent(node.bodies, tableElement, { table: node });
    parentElement.appendChild(tableElement);

    return tableElement;
  }

  renderTableHead(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-head'))
      return;

    let theadElement = document.createElement('thead');
    this.renderContent(node.rows, theadElement, { ...options, head: node });
    parentElement.appendChild(theadElement);

    return theadElement;
  }

  renderTableFoot(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-foot'))
      return;

    let tfootElement = document.createElement('tfoot');
    this.renderContent(node.rows, tfootElement, { ...options, foot: node });
    parentElement.appendChild(tfootElement);

    return tfootElement;
  }

  renderTableBody(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-body'))
      return;

    let tbodyElement = document.createElement('tbody');
    this.renderContent(node.rows, tbodyElement, { ...options, body: node });
    parentElement.appendChild(tbodyElement);

    return tbodyElement;
  }

  renderTableRow(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-row'))
      return;

    let trElement = document.createElement('tr');
    this.renderContent(node.cells, trElement, { ...options, row: node });
    parentElement.appendChild(trElement);

    return trElement;
  }

  renderTableCell(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-cell'))
      return;

    let cellElement = document.createElement(options.head ? 'th' : 'td');
    if (node.attrs) {
      for (const [key, value] of Object.entries(node.attrs)) {
        cellElement.setAttribute(key, value);
      }
    }

    const body = options.body || options.head || options.foot;
    const columns = body?.columns;
    if (columns) {
      let columnIndex;
      const row = options.row;
      if (row)
        columnIndex = options.row?.cells?.indexOf(node);
      
      if (typeof columnIndex === 'undefined' || columnIndex < 0)
        columnIndex = parentElement.children.length;

      const column = columns[columnIndex];
      if (column) {
        if (column.attrs) {
          for (const [key, value] of Object.entries(column.attrs)) {
            cellElement.setAttribute(key, value);
          }
        }

        if (column.align) {
          cellElement.style.textAlign = column.align;
        }
      }
    }

    this.renderContent(node.content, cellElement);
    parentElement.appendChild(cellElement);

    return cellElement;
  }
}