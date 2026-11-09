import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import MDParser from '../utils/md-parser.js';
import { _, addLocaleUrl, onLanguageLoaded } from '../locale/locale.js';

importCss('./md-viewer.css', import.meta.url);

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

const renderDataDefaultOptions = {
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
  renderDataDefaultOptions.items.forEach(item => {
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
    this.renderData(this.#doc?.metadata, this.element, { className: 'metadata' });
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
      throw new Error('El elemento padre es nulo o indefinido.');
    
    if (!node)
      this.renderError('El nodo es nulo o indefinido.', parentElement);

    if (type && node?.type !== type)
      this.renderError(`El tipo de nodo recibido "${node?.type}" no es el esperado: ${type}.`, parentElement);

    return true;
  }

  renderNode(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement))
      return;

    const renderer = this.#nodeRenderers[node.type];
    if (!renderer) {
      this.renderError("Tipo de elemento desconocido: " + node.type, parentElement);
      return;
    }

    renderer(node, parentElement, options);
  }

  renderData(data, parentElement, options) {
    if (!data || !parentElement)
      return;

    options = { ...renderDataDefaultOptions, ...options };

    const element = document.createElement('div');
    parentElement.appendChild(element);
    element.classList.add('data');
    if (options.className)
      element.classList.add(options.className);

    let ruleElement = document.createElement('hr');
    ruleElement.classList.add('single-rule');
    element.appendChild(ruleElement);

    const items = options?.items || [];

    if (!items.length || options?.restItems !== false) {
      for (const [key, value] of Object.entries(data)) {
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

    ruleElement = document.createElement('hr');
    ruleElement.classList.add('single-rule');
    element.appendChild(ruleElement);

    return element;
  }

  renderContent(content, parentElement, options) {
    this.renderNodes(content, parentElement, options);
  }

  renderNodes(nodes, parentElement, options) {
    if (!parentElement)
      throw new Error('El elemento padre es nulo o indefinido.');
    
    if (!nodes)
      throw new Error('El contenido de los nodos es nulo o indefinido.');

    if (!Array.isArray(nodes)) {
      this.renderNode(nodes, parentElement, options);
      return;
    }
    
    if (!nodes?.length)
      return;

    for (const node of nodes)
      this.renderNode(node, parentElement, options);
  }

  renderText(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'text'))
      return;

    let textNode = document.createTextNode(node.text);
    parentElement.appendChild(textNode);
  }

  renderDocument(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'document'))
      return;

    const docElement = document.createElement('div');
    docElement.classList.add('document');
    parentElement.appendChild(docElement);
    this.renderContent(node.content, docElement);
  }

  renderHeading(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'heading'))
      return;

    let headingElement = document.createElement(`h${node.level}`);
    this.renderContent(node.content, headingElement);
    parentElement.appendChild(headingElement);
  }

  renderRule(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'rule'))
      return;

    let ruleElement = document.createElement('hr');
    ruleElement.classList.add('rule');
    parentElement.appendChild(ruleElement);
  }

  renderParagraph(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'paragraph'))
      return;

    let paragraphElement = document.createElement('p');
    this.renderContent(node.content, paragraphElement);
    parentElement.appendChild(paragraphElement);
  }

  renderStrong(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'strong'))
      return;

    let strongElement = document.createElement('strong');
    this.renderContent(node.content, strongElement);
    parentElement.appendChild(strongElement);
  }

  renderEmphasis(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'em'))
      return;

    let emElement = document.createElement('em');
    this.renderContent(node.content, emElement);
    parentElement.appendChild(emElement);
  }

  renderStrongItalic(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'strong-italic'))
      return;

    const strongItalicElement = document.createElement('strong');
    const emElement = document.createElement('em');
    this.renderContent(node.content, emElement);
    strongItalicElement.appendChild(emElement);
    parentElement.appendChild(strongItalicElement);
  }

  renderMark(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'mark'))
      return;

    let markElement = document.createElement('mark');
    this.renderContent(node.content, markElement);
    parentElement.appendChild(markElement);
  }

  renderSubscript(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'sub'))
      return;

    let subElement = document.createElement('sub');
    this.renderContent(node.content, subElement);
    parentElement.appendChild(subElement);
  }

  renderSuperscript(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'sup'))
      return;

    let supElement = document.createElement('sup');
    this.renderContent(node.content, supElement);
    parentElement.appendChild(supElement);
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
  }

  renderList(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'list'))
      return;

    let listElement = document.createElement(node.ordered ? 'ol' : 'ul');
    this.renderContent(node.content, listElement);
    parentElement.appendChild(listElement);
  }

  renderListItem(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'list-item'))
      return;

    let listItemElement = document.createElement('li');
    this.renderContent(node.content, listItemElement);
    parentElement.appendChild(listItemElement);
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
  }

  renderFootnote(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'footnote'))
      return;

    let footnoteElement = document.createElement('span');
    footnoteElement.classList.add('footnote');
    footnoteElement.innerHTML = `[^${node.id}]`;
    parentElement.appendChild(footnoteElement);
    this.renderContent(node.content, footnoteElement);
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
  }

  renderBlockquote(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'blockquote'))
      return;

    let blockquoteElement = document.createElement('blockquote');
    this.renderContent(node.content, blockquoteElement);
    parentElement.appendChild(blockquoteElement);
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
  }

  renderTableHead(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-head'))
      return;

    let theadElement = document.createElement('thead');
    this.renderContent(node.rows, theadElement, { ...options, head: node });
    parentElement.appendChild(theadElement);
  }

  renderTableFoot(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-foot'))
      return;

    let tfootElement = document.createElement('tfoot');
    this.renderContent(node.rows, tfootElement, { ...options, foot: node });
    parentElement.appendChild(tfootElement);
  }

  renderTableBody(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-body'))
      return;

    let tbodyElement = document.createElement('tbody');
    this.renderContent(node.rows, tbodyElement, { ...options, body: node });
    parentElement.appendChild(tbodyElement);
  }

  renderTableRow(node, parentElement, options) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-row'))
      return;

    let trElement = document.createElement('tr');
    this.renderContent(node.cells, trElement, { ...options, row: node });
    parentElement.appendChild(trElement);
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
  }
}

/*
function mdRule2Html(lines) {
  const regExp = /^\s{0,3}(---+|===+|\*\*\*+|\.\.\.+|≡≡≡+|___+|- - -|\. \. \.)/;
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  let className;
  let pattern = matches[1].slice(0, 5);
  className = pattern === '- - -' ? 'dashed-rule' :
    pattern === '. . .' ? 'dotted-rule' :
    '';
    
  if (!className) {
    pattern = matches[1].slice(0, 3);
    className = pattern === '---' ? 'single-rule' :
      pattern === '___' ? 'single-rule' :
      pattern === '===' ? 'double-rule' :
      pattern === '===' ? 'double-rule' :
      pattern === '≡≡≡' ? 'triple-rule' :
      pattern === '...' ? 'dotted-rule' :
      pattern === '***' ? 'dotted2-rule' :
      'single-rule';
  }

  lines.shift();
  return `<hr class="${className}">`;
}

function mdList2Html(lines) {
  const normalListRegExp = /^(\s*)(\*)\s+(.+)$/;
  const orderedListRegExp = /^(\s*)(\d+\.)\s+(.+)$/;
  const automaticListRegExp = /^(\s*)(\(@\))\s+(.+)$/;
  const ineractiveListRegExp = /^(\s*)(-\s+\[[ xX]\])\s+(.+)$/;

  const line = lines[0];
  let regExp, marker, matches, tag, className;
  if (matches = normalListRegExp.exec(line)) {
    marker = '*';
    regExp = normalListRegExp;
    tag = 'ul';
    className = 'normal-list';
  } else if (matches = orderedListRegExp.exec(line)) {
    marker = '1.';
    regExp = orderedListRegExp;
    tag = 'ol';
    className = 'ordered-list';
  } else if (matches = automaticListRegExp.exec(line)) {
    marker = '(@)';
    regExp = automaticListRegExp;
    tag = 'ol';
    className = 'automatic-list';
  } else if (matches = ineractiveListRegExp.exec(line)) {
    marker = '[]';
    regExp = ineractiveListRegExp;
    tag = 'ul';
    className = 'interactive-list';
  } else {
    return;
  }

  const items = [];
  const indent = matches[1];

  let nextItem;
  while (nextItem = mdItem2Html(lines, regExp, indent, marker)) {
    items.push(nextItem);
  }

  return `<${tag} class="${className}">${items.join('')}</${tag}>`;
}

function mdItem2Html(lines, regExp, indent, marker) {
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  if (matches[1].length > indent.length)
    return mdList2Html(lines);

  if (matches[1].length !== indent.length)
    return;

  lines.shift();

  let text = mdFormat(matches[3]);
  let thisMarker = matches[2];
  if (/\d+/.test(thisMarker))
    thisMarker = '1.';
  else if (/-\s+\[[ xX]\]/.test(thisMarker)) {
    const id = 'interactive-item-' + Math.random().toString(36).slice(2, 16);
    const checked = /\[[xX]\]/.test(thisMarker) ? ' checked' : '';
    thisMarker = '[]';
    text = `<input id=${id} type="checkbox" ' + ${checked}><label for=${id}>${text}</label>`;
  }

  if (thisMarker !== marker)
    return;

  return `<li>${text}</li>`;
}
*/