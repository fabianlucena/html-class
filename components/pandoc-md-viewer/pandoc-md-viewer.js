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
  const lines = md.split(/\n/gm);
  console.log(lines);

  let res;
  let matches;
  const htmlParts = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!line)
      continue;

    res = pandocMdRule2Html(lines, i)
      ?? pandocMdHeading2Html(lines, i)
      ?? pandocMdList2Html(lines, i)
      ?? pandocMdBlockquote2Html(lines, i)
      ?? pandocMdDefinitions2Html(lines, i)
      ?? pandocMdFootNote2Html(lines, i)
      ?? pandocMdTable2Html(lines, i)
      ?? pandocMdCodeBlock2Html(lines, i);

    if (res) {
      i = res.i;
      htmlParts.push(res.html);
      continue;
    }

    let text = line.trim();

    htmlParts.push('<p>' + pandocMdFormat(text) + '</p>');
  }

  return htmlParts.join('');
}

function pandocMdFormat(md) {
  md = md.trim();
  if (!md)
    return '';

  md = md.replace(/\[\^([^\]]+)\]/g, '<sup><a href="#fn-$1">$1</a></sup>');

  md = md
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

function pandocMdRule2Html(lines, i) {
  if (!/^\s{0,3}---$/.test(lines[i]))
    return;

  return { i, html: '<hr>' };
}

function pandocMdHeading2Html(lines, i) {
  const matches = /^\s{0,3}(#+)\s+(.+)?$/.exec(lines[i]);
  if (!matches)
    return;

  const level = matches[1].length;
  const headingTag = 'h' + level;
  const html = '<' + headingTag + '>' + pandocMdFormat(matches[2]) + '</' + headingTag + '>';
  return { i, html };
}

function pandocMdList2Html(lines, i) {
  const normalListRegExp = /^(\s*)(\*)\s+(.+)$/;
  const orderedListRegExp = /^(\s*)(\d+\.)\s+(.+)$/;
  const automaticListRegExp = /^(\s*)(\(@\))\s+(.+)$/;
  const ineractiveListRegExp = /^(\s*)(-\s+\[[ xX]\])\s+(.+)$/;

  let regExp, marker, matches, tag, interactive, checked;
  if (matches = normalListRegExp.exec(lines[i])) {
    marker = '*';
    regExp = normalListRegExp;
    tag = 'ul';
  } else if (matches = orderedListRegExp.exec(lines[i])) {
    marker = '1.';
    regExp = orderedListRegExp;
    tag = 'ol';
  } else if (matches = automaticListRegExp.exec(lines[i])) {
    marker = '(@)';
    regExp = automaticListRegExp;
    tag = 'ol';
  } else if (matches = ineractiveListRegExp.exec(lines[i])) {
    marker = '[]';
    regExp = ineractiveListRegExp;
    tag = 'ul';
    interactive = true;
    checked = /\[[xX]\]/.test(matches[2]);
  } else {
    return;
  }
  
  const items = [];
  const indent = matches[1];

  items.push('<li>' + (interactive ? '<input type="checkbox" ' + (checked ? 'checked' : '') + '>' : '') + pandocMdFormat(matches[3]) + '</li>');
  let nextItem;
  while (nextItem = pandocMdItem2Html(lines, i + 1, regExp, indent, marker)) {
    i = nextItem.i;
    items.push(nextItem.html);
  }

  const html = `<${tag}>` + items.join('') + `</${tag}>`;
  return { i, html };
}

function pandocMdItem2Html(lines, i, regExp, indent, marker) {
  const matches = regExp.exec(lines[i]);
  if (!matches)
    return;

  if (matches[1].length > indent.length)
    return pandocMdList2Html(lines, i);

  if (matches[1].length !== indent.length)
    return;

  let thisMarker = matches[2], interactive, checked;
  if (/\d+/.test(thisMarker))
    thisMarker = '1.';
  else if (/-\s+\[[ xX]\]/.test(thisMarker)) {
    interactive = true;
    checked = /\[[xX]\]/.test(thisMarker);
    thisMarker = '[]';
  }

  if (thisMarker !== marker)
    return;

  const html = `<li>` + (interactive ? '<input type="checkbox" ' + (checked ? 'checked' : '') + '>' : '') + pandocMdFormat(matches[3]) + `</li>`;
  return { i, html };
}

function pandocMdBlockquote2Html(lines, i) {
  let matches = /^\s{0,3}>\s+(.+)$/.exec(lines[i]);
  if (!matches)
    return;

  let htmlLines = [];
  do {
    htmlLines.push(pandocMdFormat(matches[1]));
  } while (matches = /^\s{0,3}>\s+(.+)$/.exec(lines[++i]));
  i--;
  
  
  return { i, html: '<blockquote>' + htmlLines.join('<br>') + '</blockquote>' };
}

function pandocMdDefinitions2Html(lines, i) {
  let prev = i;
  let defs = [];
  while (true) {
    const term = lines[i].trim();
    if (!term)
      break;

    let matches = /^\s{0,3}:\s*(.+)$/.exec(lines[i + 1]);
    if (!matches)
      break;

    let def = `<dt>${pandocMdFormat(term)}</dt><dd>${pandocMdFormat(matches[1])}</dd>`;
    i += 2;
    prev = i;
    
    while (matches = /^\s{0,3}:\s*(.+)$/.exec(lines[i])) {
      def += `<dd>${pandocMdFormat(matches[1])}</dd>`;
      i++;
      prev = i;
    }

    defs.push(def);

    while (!lines[i].trim() && i < lines.length)
      i++;
  }

  if (!defs.length)
    return null;

  i = prev;
  const html = defs.length ? `<dl>${defs.join('')}</dl>` : '';

  return { i, html };
}

function pandocMdFootNote2Html(lines, i) {
  const matches = /^\s{0,3}\[\^([^\]]+)\]:\s+(.+)$/.exec(lines[i]);
  if (!matches)
    return;

  const html = '<p><sup id="fn-' + matches[1] + '">' + matches[1] + '</sup>' + pandocMdFormat(matches[2]) + '</p>';
  return { i, html };
}

function pandocMdTable2Html(lines, i) {
  let matches = /^\s{0,3}\|\s*(.+)$/.exec(lines[i]);  
  if (!matches)
    return;

  const rows = [];
  let defaultStyles = [];
  do {
    if (rows.length === 1 && /^\s{0,3}\|\s*(:?-+:?\s*\|)+\s*$/.test(lines[i])) {
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

  } while (matches = /^\s{0,3}\|\s*(.+)$/.exec(lines[++i]));
  i--;

  let tableHtml = '';
  rows.forEach(row => {
    tableHtml += '<tr>' + row.join('') + '</tr>';
  });
  const html = '<table>' + tableHtml + '</table>';

  return { i, html };
}

function pandocMdCodeBlock2Html(lines, i) {
  let matches  = /^\s{0,3}```\s*(\w+)?\s*(\{[^\}]+\})?\s*$/.exec(lines[i]);
  if (!matches)
    return;

  i++;
  let lang = matches[1] || '';
  let attrs = matches[2] || '';
  let codeLines = [];
  do {
    if (/^\s{0,3}```\s*$/.test(lines[i]))
      break;

    codeLines.push(lines[i++]);
  } while (i < lines.length);

  const html = '<pre><code class="language-' + lang + '" ' + attrs + '>' + codeLines.map(line => line?.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n') + '</code></pre>';
 
  return { i, html };
}