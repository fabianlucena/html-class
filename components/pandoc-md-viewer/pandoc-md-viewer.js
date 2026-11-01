import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';

importCss('./pandoc-md-viewer.css', import.meta.url);

export default class PandocMDViewer extends Base {
  #md = '';

  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    super.create({ ...options, defaultParentElement: document.body });

    this.element ??= document.createElement('div');

    this.element.classList.add('pandoc-md-viewer');
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }

  get md() {
    return this.#md;
  }

  set md(value) {
    this.#md = value;
    this.render(value);
  }

  render(md) {
    this.element.innerHTML = pandocMd2Html(md);
  }
}

function pandocMd2Html(md) {
  let lines = md.split(/\n/gm);
  // console.log(lines);

  let htmlPart, htmlP = [];
  const htmlParts = [];
  while (lines.length) {
    htmlPart = pandocMdRule2Html(lines)
      ?? pandocMdHeading2Html(lines)
      ?? pandocMdList2Html(lines)
      ?? pandocMdBlockquote2Html(lines)
      ?? pandocMdDefinitions2Html(lines)
      ?? pandocMdFootNote2Html(lines)
      ?? pandocMdTable2Html(lines)
      ?? pandocMdCodeBlock2Html(lines)
      ?? pandocMdNoteBlock2Html(lines);

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

    htmlP.push(pandocMdFormat(line));
  }

  return htmlParts.join('');
}

function pandocMdFormat(md) {
  md = md.trim();
  if (!md)
    return '';

  md = md.replace(/\[\^([^\]]+)\]/g, '<sup><a href="#fn-$1">$1</a></sup>');

  md = md
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><i>$1</i></strong>')
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/\*{1}(.+?)\*{1}/g, '<em>$1</em>')
    .replace(/_{3}(.+?)_{3}/g, '<strong><i>$1</i></strong>')
    .replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>')
    .replace(/_{1}(.+?)_{1}/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/~(.+?)~/g, '<sub>$1</sub>')
    .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>');

  if (md.includes('\\'))
    md = md
      .replace(/\\sum/g, '&sum;')
      .replace(/\\int/g, '&int;')
      .replace(/\\sqrt/g, '&radic;')
      .replace(/\\infty/g, '&infin;')
      .replace(/\\pi/g, '&pi;');

    return md;
}

function pandocMdRule2Html(lines) {
  const regExp = /^\s{0,3}---$/;
  if (!regExp.test(lines[0]))
    return;

  lines.shift();
  return '<hr>';
}

function pandocMdHeading2Html(lines) {
  const regExp = /^\s{0,3}(#+)\s+(.+)?$/;
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  const level = matches[1].length;
  const headingTag = 'h' + level;
  return '<' + headingTag + '>' + pandocMdFormat(matches[2]) + '</' + headingTag + '>';
}

function pandocMdList2Html(lines) {
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
  while (nextItem = pandocMdItem2Html(lines, regExp, indent, marker)) {
    items.push(nextItem);
  }

  return `<${tag} class="${className}">${items.join('')}</${tag}>`;
}

function pandocMdItem2Html(lines, regExp, indent, marker) {
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  if (matches[1].length > indent.length)
    return pandocMdList2Html(lines);

  if (matches[1].length !== indent.length)
    return;

  lines.shift();

  let text = pandocMdFormat(matches[3]);
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

function pandocMdBlockquote2Html(lines) {
  const regExp = /^\s{0,3}>\s+(.+)$/;
  let matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  let htmlLines = [];
  do {
    lines.shift();
    htmlLines.push(pandocMdFormat(matches[1]));
  } while (matches = regExp.exec(lines[0]));
  
  return '<blockquote>' + htmlLines.join('<br>') + '</blockquote>';
}

function pandocMdDefinitions2Html(lines) {
  const ddRegExp = /^\s{0,3}:\s*(.+)$/;

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
    let def = `<dt>${pandocMdFormat(term)}</dt><dd>${pandocMdFormat(matches[1])}</dd>`;
    
    while (matches = ddRegExp.exec(lines[0])) {
      lines.shift();
      def += `<dd>${pandocMdFormat(matches[1])}</dd>`;
    }

    defs.push(def);

    while (lines[0] && !lines[0].trim())
      lines.shift();
  }

  if (!defs.length)
    return;

  return `<dl>${defs.join('')}</dl>` ;
}

function pandocMdFootNote2Html(lines) {
  const regExp = /^\s{0,3}\[\^([^\]]+)\]:\s+(.+)$/;
  const matches = regExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  return `<p><sup id="fn-${matches[1]}">${matches[1]}</sup>${pandocMdFormat(matches[2])}</p>`;
}

function pandocMdTable2Html(lines) {
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

function pandocMdCodeBlock2Html(lines) {
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

function pandocMdNoteBlock2Html(lines) {
const beginRegExp = /^\s{0,3}:{3}(?:\s+(.+))?\s*$/gm;
  const endRegExp = /^\s{0,3}:{3}\s*$/;

  let matches = beginRegExp.exec(lines[0]);
  if (!matches)
    return;

  lines.shift();
  let noteLines = [];
  do {
    const line = lines.shift();
    if (endRegExp.test(line)) 
      break;

    noteLines.push(pandocMdFormat(line));
  } while (lines.length);

  let className = 'note';
  const attr = [];
  const noteType = matches[1] ? matches[1].trim() : '';
  const optionsMatches = /\{(.+)\}/.exec(noteType);
  if (optionsMatches) {
    optionsMatches[1].split(/\s+/).forEach(option => {
      if (option.startsWith('.')) {
        attr.push(option.slice(1));
      }
    });
  } else if (noteType) {
    className += ' ' + noteType.toLocaleLowerCase();
  }
  
  return `<div class="${className} ${attr.join(' ')}">${noteLines.join('\n')}</div>`;
}