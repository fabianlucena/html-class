import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import MDParser from '../utils/md-parser.js';

importCss('./md-viewer.css', import.meta.url);

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

    console.log(this.#doc.content.slice(0, 300));
  }

  render() {
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

  renderNode(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement))
      return;

    const renderer = this.#nodeRenderers[node.type];
    if (!renderer) {
      this.renderError("Tipo de elemento desconocido: " + node.type, parentElement);
      return;
    }

    renderer(node, parentElement);
  }

  renderContent(content, parentElement) {
    this.renderNodes(content, parentElement);
  }

  renderNodes(nodes, parentElement) {
    if (!parentElement)
      throw new Error('El elemento padre es nulo o indefinido.');
    
    if (!nodes)
      throw new Error('El contenido de los nodos es nulo o indefinido.');

    if (!Array.isArray(nodes)) {
      this.renderNode(nodes, parentElement);
      return;
    }
    
    if (!nodes?.length)
      return;

    for (const node of nodes)
      this.renderNode(node, parentElement);
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
      this.renderContent(node.head, tableElement);

    if (node.foot)
      this.renderContent(node.foot, tableElement);

    this.renderContent(node.bodies, tableElement);
    parentElement.appendChild(tableElement);
  }

  renderTableHead(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-head'))
      return;

    let theadElement = document.createElement('thead');
    this.renderContent(node.rows, theadElement);
    parentElement.appendChild(theadElement);
  }

  renderTableFoot(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-foot'))
      return;

    let tfootElement = document.createElement('tfoot');
    this.renderContent(node.rows, tfootElement);
    parentElement.appendChild(tfootElement);
  }

  renderTableBody(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-body'))
      return;

    let tbodyElement = document.createElement('tbody');
    this.renderContent(node.rows, tbodyElement);
    parentElement.appendChild(tbodyElement);
  }

  renderTableRow(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-row'))
      return;

    let trElement = document.createElement('tr');
    this.renderContent(node.cells, trElement);
    parentElement.appendChild(trElement);
  }

  renderTableCell(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement, 'table-cell'))
      return;

    let cellElement = document.createElement(node.header ? 'th' : 'td');
    if (node.attrs) {
      for (const [key, value] of Object.entries(node.attrs)) {
        cellElement.setAttribute(key, value);
      }
    }

    this.renderContent(node.content, cellElement);
    parentElement.appendChild(cellElement);
  }
}

/*
function md2Html(md) {
  let lines = md.split(/\n/gm);
  // console.log(lines);

  while (lines.length && !lines[0].trim())
    lines.shift();

  const htmlParts = [];

  const metadata = extractYaml(lines);
  if (metadata) {
    htmlParts.push(mdMetadata2Html(metadata));
  }

  let htmlPart, htmlP = [];
  while (lines.length) {
    htmlPart = mdRule2Html(lines)
      ?? mdHeading2Html(lines)
      ?? mdList2Html(lines)
      ?? mdBlockquote2Html(lines)
      ?? mdDefinitions2Html(lines)
      ?? mdFootNote2Html(lines)
      ?? mdTable2Html(lines)
      ?? mdCodeBlock2Html(lines)
      ?? mdBlock2Html(lines);

    if (htmlPart) {
      if (htmlP.length) {
        htmlParts.push(`<p>${htmlP.join(' ')}</p>`);
        htmlP = [];
      }
      
      htmlParts.push(htmlPart);
      continue;
    }

    const line = lines.shift().trim();
    if (!line) {
      if (htmlP.length) {
        htmlParts.push(`<p>${htmlP.join(' ')}</p>`);
        htmlP = [];
      }

      continue;
    }

    htmlP.push(mdFormat(line));
  }

  return htmlParts.join('');
}

function mdFormat(md) {
  const citationRegex = /\[@([a-zA-Z0-9_-]+)(?:,\s*([^\]]+))?\]/g;
  const imageRegex = /!\[([^\]]*?)\]\(([^)]+?)(?:\s+"([^"]+)")?\)/g;
  const linkRegex = /\[([^\]]+?)\]\(([^)]+?)(?:\s+"([^"]+)")?\)/g;

  md = md.trim();
  if (!md)
    return '';

  md = md
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\$\$(.+?)\$\$/g, (_, math) => math2html(math, { display: 'block' }))
    .replace(/\$(.+?)\$/g, (_, math) => math2html(math, { display: 'inline' }))
    .replace(/\[\^([^\]]+)\]/g, '<sup><a href="#fn-$1">$1</a></sup>')
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><i>$1</i></strong>')
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/\*{1}(.+?)\*{1}/g, '<em>$1</em>')
    .replace(/_{3}(.+?)_{3}/g, '<strong><i>$1</i></strong>')
    .replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>')
    .replace(/_{1}(.+?)_{1}/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/~(.+?)~/g, '<sub>$1</sub>')
    .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(citationRegex, (_, key, page) => {
      const detalle = page ? `, ${page}` : '';
      return `<cite class="citation" data-ref="${key}"><a href="#ref-${key}">(${key}${detalle})</a></cite>`;
    })
    .replace(imageRegex, (_, alt, url, title) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${url.trim()}" alt="${alt}"${titleAttr} style="max-width: 100%; height: auto;" loading="lazy" />`;
    })
    .replace(linkRegex, (_, textContent, url, title) => {
      const titleAttr = title ? ` title="${title}"` : '';
      const isExternal = url.startsWith('http');
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url.trim()}"${titleAttr}${targetAttr}>${textContent}</a>`;
    });

  if (md.includes('\\'))
    md = md
      .replace(/\\sum/g, '&sum;')
      .replace(/\\int/g, '&int;')
      .replace(/\\sqrt/g, '&radic;')
      .replace(/\\infty/g, '&infin;')
      .replace(/\\pi/g, '&pi;');

    return md;
}

function extractYaml(lines) {
  const beginYamlRegExp = /^\s{0,3}---\s*$/;
  const endYamlRegExp = /^\s{0,3}---\s*$/;
  const kvReExp = /^([a-zA-Z0-9_-]+):\s*(.*)$/;

  const match = beginYamlRegExp.exec(lines[0]);
  if (!match)
    return;

  lines.shift();

  let key;
  const metadata = {};
  while (lines.length && !endYamlRegExp.test(lines[0])) {
    const line = lines.shift();

    const matchKV = kvReExp.exec(line);
    if (matchKV) {
      key = matchKV[1];
      const value = matchKV[2].trim();

      if (value === '|' || value === '>') {
          metadata[key] = '';
      } else {
        metadata[key] = value.replace(/^["'](.*)["']$/, '$1');
        key = null;
      }
    } else if (key && line.startsWith('  ')) {
      metadata[key] += (metadata[key] ? '\n' : '') + line.trim();
    }
  }

  lines.shift();

  return metadata;
}

function mdMetadata2Html(metadata) {
  if (!metadata)
    return '';

  const { title, author, date, abstract, lang, ...rest } = metadata;

  let html = '';

  if (title)
    html += `<h1>${title}</h1>`;

  if (author)
    html += `<div class="metadata-item"><span class="metadata-key">Author:</span> <span class="metadata-value">${author}</span></div>`;

  if (date)
    html += `<div class="metadata-item"><span class="metadata-key">Date:</span> <span class="metadata-value">${date}</span></div>`;

  if (abstract)
    html += `<div class="metadata-item"><span class="metadata-key">Abstract:</span> <span class="metadata-value">${abstract}</span></div>`;

  if (lang)
    html += `<div class="metadata-item"><span class="metadata-key">Language:</span> <span class="metadata-value">${lang}</span></div>`;

  for (const [key, value] of Object.entries(rest)) {
    html += `<div class="metadata-item"><span class="metadata-key">${key}:</span> <span class="metadata-value">${value}</span></div>`;
  }
  
  return `<div class="metadata">${html}</div><hr class="single-rule">`;
}

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

function mdHeading2Html(lines) {
  const regExp = /^\s{0,3}(#+)\s+(.+)?$/;
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  const level = matches[1].length;
  const headingTag = 'h' + level;
  return '<' + headingTag + '>' + mdFormat(matches[2]) + '</' + headingTag + '>';
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

function mdBlockquote2Html(lines) {
  const regExp = /^\s{0,3}>\s+(.+)$/;
  let matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  let htmlLines = [];
  do {
    lines.shift();
    htmlLines.push(mdFormat(matches[1]));
  } while (matches = regExp.exec(lines[0]));
  
  return '<blockquote>' + htmlLines.join('<br>') + '</blockquote>';
}

function mdDefinitions2Html(lines) {
  const ddRegExp = /^\s{0,3}:[^:]\s*(.+)$/;

  let defs = [];
  while (true) {
    const term = lines[0].trim();
    if (!term)
      break;

    let matches = ddRegExp.exec(lines[1]);
    if (!matches)
      break;

    lines.shift();
    lines.shift();
    let def = `<dt>${mdFormat(term)}</dt><dd>${mdFormat(matches[1])}</dd>`;
    
    while (matches = ddRegExp.exec(lines[0])) {
      lines.shift();
      def += `<dd>${mdFormat(matches[1])}</dd>`;
    }

    defs.push(def);

    while (lines[0] && !lines[0].trim())
      lines.shift();
  }

  if (!defs.length)
    return;

  return `<dl>${defs.join('')}</dl>` ;
}

function mdFootNote2Html(lines) {
  const regExp = /^\s{0,3}\[\^([^\]]+)\]:\s+(.+)$/;
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  return `<p><sup id="fn-${matches[1]}">${matches[1]}</sup>${mdFormat(matches[2])}</p>`;
}

function mdTable2Html(lines) {
  const tableRowRegexp = /^\s{0,3}\|\s*(.+)\s*\|$/;
  const tableHeaderRegexp = /^\s{0,3}\|\s*(:?-+:?\s*\|)+\s*$/;

  let matches = tableRowRegexp.exec(lines[0]);  
  if (!matches)
    return;

  const rows = [];
  let defaultStyles = [];
  do {
    if (rows.length === 1 && tableHeaderRegexp.test(lines[0])) {
      matches[1].split('|').map((cell, i) => {
        let style = defaultStyles[i] || '';
        if (cell.startsWith(':')) {
          if (cell.endsWith(':')) {
            style="text-align:center";
          } else {
            style="text-align:left";
          }
        } else if (cell.endsWith(':')) {
          style="text-align:right";
        }

        defaultStyles.push(style);
      });
    } else {
      rows.push(matches[1].split('|').map((cell, i) => {
        let style = defaultStyles[i] || '';
        cell = cell.trim();
        if (cell.startsWith(':')) {
          if (cell.endsWith(':')) {
            style="text-align:center";
            cell = cell.slice(1, -1).trim();
          } else {
            style="text-align:left";
            cell = cell.slice(1).trim();
          }
        } else if (cell.endsWith(':')) {
          style="text-align:right";
          cell = cell.slice(0, -1).trim();
        }

        if (rows.length === 1) {
          if (/^-*$/.test(cell))
            cell = '';
          
          defaultStyles.push(style);
        }

        const tag = rows.length === 0 ? 'th' : 'td';

        return '<' + tag + ' style="' + style + '">' + cell.trim() + '</' + tag + '>';
      }));
    }

    lines.shift();
  } while (matches = tableRowRegexp.exec(lines[0]));
  lines.shift();

  let tableHtml = '';
  rows.forEach(row => {
    tableHtml += '<tr>' + row.join('') + '</tr>';
  });

  return '<table>' + tableHtml + '</table>';
}

function mdCodeBlock2Html(lines) {
  const beginRegExp = /^\s{0,3}```\s*(\w+)?\s*(\{[^\}]+\})?\s*$/;
  const endRegExp = /^\s{0,3}```\s*$/;

  let matches = beginRegExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  let lang = matches[1] || '';
  let attrs = matches[2] || '';
  let codeLines = [];
  do {
    const line = lines.shift();
    if (endRegExp.test(line)) 
      break;

    codeLines.push(line);
  } while (lines.length);
  
  return `<pre><code class="language-${lang} block" ${attrs}>${codeLines.map(line => line?.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n')}</code></pre>`;
}

function mdBlock2Html(lines) {
  const beginRegExp = /^\s{0,3}:{3}(?:\s+(.+))?\s*$/gm;
  const endRegExp = /^\s{0,3}:{3}\s*$/;

  let matches = beginRegExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  let blockLines = [];
  do {
    const line = lines.shift();
    if (endRegExp.test(line)) 
      break;

    blockLines.push(mdFormat(line));
  } while (lines.length);

  let className = 'block';
  const attr = [];
  const blockType = matches[1] ? matches[1].trim() : '';
  const optionsMatches = /\{(.+)\}/.exec(blockType);
  if (optionsMatches) {
    optionsMatches[1].split(/\s+/).forEach(option => {
      if (option.startsWith('.')) {
        attr.push(option.slice(1));
      }
    });
  } else if (blockType) {
    className += ' ' + blockType.toLocaleLowerCase();
  }
  
  return `<div class="${className} ${attr.join(' ')}">${blockLines.join('\n')}</div>`;
}
*/