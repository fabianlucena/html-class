import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';

importCss('./md-viewer.css', import.meta.url);

export default class MDViewer extends Base {
  #md = '';

  constructor(options) {
    super();
    this.create(options);
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

  get md() {
    return this.#md;
  }

  set md(value) {
    this.#md = value;
    this.render(value);
  }

  render(md) {
    this.element.innerHTML = md2Html(md);
  }
}

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
      ?? mdNoteBlock2Html(lines);

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

function math2html(math, { display = 'block' } = {}) {
  const tokens = mathTokenizer(math);
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="${display}">
    <mrow>
      ${tokens2html(tokens)}
    </mrow>
  </math>`;
}

function mathTokenizer(math) {
  const tokens = [];
  const words = ['sin', 'cos', 'tan', 'log', 'ln', 'lim', 'max', 'min', 'exp', 'mod', 'gcd', 'lcm', 'det', 'dim', 'arg', 'ker', 'deg', 'hom', 'span', 'div', 'curl', 'grad'];

  for (let i = 0; i < math.length; i++) {
    const char = math[i];

    if (/\s/.test(char))
      continue;

    if (char === '\\') {
      let cmd = '\\';
      i++;
      while (i < math.length && /[a-zA-Z]/.test(math[i])) {
        cmd += math[i];
        i++;
      }
      i--;
      tokens.push({ type: 'COMMAND', value: cmd });
    } else if (/[0-9]/.test(char)) {
      let word = '';
      while (i < math.length && /[0-9]/.test(math[i])) {
        word += math[i];
        i++;
      }
      i--;

      const token = { type: 'NUMBER', value: word };
      tokens.push(token);
    } else if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < math.length && /[a-zA-Z]/.test(math[i])) {
        word += math[i];
        i++;
      }
      i--;

      if (words.includes(word)) {
        const token = { type: 'COMMAND', value: '\\' + word };
        tokens.push(token);
      } else {
        for (const letter of word) {
          const token = { type: 'IDENTIFIER', value: letter };
          tokens.push(token);
        }
      }
    } else {
      tokens.push({ type: 'SYMBOL', value: char });
    }
  }

  return tokens;
}

function tokens2html(tokens, single) {
  const commandsMap = {
    '\\sum': {
      symbol: '&sum;',
      msub: 'munder',
      msup: 'mover',
      msubsup: 'munderover',
    },
    '\\int': {
      symbol: '&int;',
    },
    '\\sqrt': {
      tag: 'msqrt',
      children: 1,
    },
    '\\infty': {
      symbol: '&infin;',
    },
    '\\pi': {
      symbol: '&pi;',
    },
    '\\pm': {
      symbol: '&plusmn;',
    },
    '\\frac': {
      tag: 'mfrac',
      children: 2,
    },
  };

  let result = '', currentCommand, node;
  while (tokens.length) {
    currentCommand = null;
    let token = tokens.shift();

    if (token.type === 'IDENTIFIER') {
      node = `<mi>${token.value}</mi>`;
    } else if (token.type === 'NUMBER') {
      node = `<mn>${token.value}</mn>`;
    } else if (token.type === 'COMMAND') {
      currentCommand = commandsMap[token.value];
      if (currentCommand) {
        let innerHtml = '';
        if (currentCommand.children) {
          for (let i = 0; i < currentCommand.children; i++) {
            innerHtml += tokens2html(tokens, true);
          }
        }

        if (currentCommand.tag)
          node = `<${currentCommand.tag}>${innerHtml}</${currentCommand.tag}>`;
        else
          node = `<mo>${currentCommand?.symbol ?? token.value}${innerHtml}</mo>`;
      } else {
        node = `<mo>${token.value}</mo>`;
      }
    } else if (token.type === 'SYMBOL') {
      if (token.value === '{') {
        const innerTokens = [];
        let braceCount = 1;
        while (tokens.length && braceCount > 0) {
          const innerToken = tokens.shift();
          if (innerToken.value === '{') {
            braceCount++;
          } else if (innerToken.value === '}') {
            braceCount--;
          }
          innerTokens.push(innerToken);
        }
        innerTokens.pop();
        node = `<mrow>${tokens2html(innerTokens)}</mrow>`;
      } else if (token.value === '^') {
        const exponent = tokens2html(tokens, true);
        node = `<msup>${exponent}</msup>`;
      } else if (token.value === '_') {
        const subscript = tokens2html(tokens, true);
        node = `<msub>${subscript}</msub>`;
      } else {
        node = `<mo>${token.value}</mo>`;
      }
    } else {
      console.warn('Unknown token type:', token.type, 'with value:', token.value);
    }

    if (!single && tokens[0]?.type === 'SYMBOL' && tokens[0].value === '^') {
      tokens.shift();
      const exponent = tokens2html(tokens, true);
      if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
        tokens.shift();
        const subscript = tokens2html(tokens, true);
        const tag = currentCommand?.msubsup || 'msubsup';
        node = `<${tag}>${node}${subscript}${exponent}</${tag}>`;
      } else {
        const tag = currentCommand?.msup || 'msup';
        node = `<${tag}>${node}${exponent}</${tag}>`;
      }
    } else if (!single && tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
      tokens.shift();
      const subscript = tokens2html(tokens, true);
      if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '^') {
        tokens.shift();
        const exponent = tokens2html(tokens, true);
        const tag = currentCommand?.msubsup || 'msubsup';
        node = `<${tag}>${node}${subscript}${exponent}</${tag}>`;
      } else {
        const tag = currentCommand?.msub || 'msub';
        node = `<${tag}>${node}${subscript}</${tag}>`;
      }
    }

    if (node) {
      result += node;
      node = null;
    }

    if (single)
      break;
  }

  return result;
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

function mdNoteBlock2Html(lines) {
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

    noteLines.push(mdFormat(line));
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