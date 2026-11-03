import { getDelimitedString } from './string.js';

export default class MDParser {
  #parsers = [
    HeadingParser,
    RuleParser,
    ListParser,
    BlockquoteParser,
    FootnoteParser,
    DefinitionsParser,
  ];
  get parsers() {
    return this.#parsers;
  }

  parse(md) {
    const lines = md.split(/\n/gm);
    const doc = {
      type: 'document',
      content: [],
    };

    while (lines.length && !lines[0].trim())
      lines.shift();

    const metadata = this.parseYaml(lines);
    if (metadata)
      doc.metadata = metadata;

    doc.content.push(...this.parseLines(lines));
    
    return doc;
  }

  parseLines(lines) {
    const nodes = [];
    while (true) {
      while (lines.length && !lines[0].trim())
        lines.shift();

      if (!lines.length)
        break;

      const node = this.parseSingleNode(lines);
      if (!node)
        continue;
      
      nodes.push(node);
    }
    return nodes;
  }

  parseSingleNode(lines, { skipParser, closeRegExp } = {}) {
    let paragraphLines = [];
    while (lines.length) {
      if (closeRegExp && closeRegExp.test(lines[0]))
        break;

      for (const parser of this.parsers) {
        if (skipParser && parser === skipParser)
          continue;

        const node = parser.parse(lines, { parser: this });
        if (node)
          return node;
      }

      const line = lines.shift().trim();
      if (!line) {
        if (!paragraphLines.length)
          continue;

        break;
      } else {
        paragraphLines.push(line);
      }
    }

    return { type: 'paragraph', content: this.parseLine(paragraphLines.join(' ')) };
  }

  parseYaml(lines) {
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

  parseLine(line, options = {}) {
    const nodes = [];
    let node;
    let text = '';

    const grouppedDefinitions = {
      '`': [
        {
          open:  '`',
          close: '`',
          type:  'code',
          property: 'code',
        },
      ],
      '$': [
        {
          open:  '$$',
          close: '$$',
          type:  'math',
          property: 'math',
          variant: 'block',
        },
        {
          open:  '$',
          close: '$',
          type:  'math',
          property: 'math',
        },
      ],
      '*': [
        {
          open:  '***',
          close: '***',
          type:  'strong-italic',
        },
        {
          open:  '**',
          close: '**',
          type:  'strong',
        },
        {
          open:  '*',
          close: '*',
          type:  'em',
        },
      ],
      '_': [
        {
          open:  '__',
          close: '__',
          type:  'em',
        },
      ],
      '~': [
        {
          open:  '~~',
          close: '~~',
          type:  'del',
        },
      ],
      '=': [
        {
          open:  '==',
          close: '==',
          type:  'mark',
        },
      ],
      '^': [
        {
          open:  '^',
          close: '^',
          type:  'sup',
        },
      ],
      '~': [
        {
          open:  '~',
          close: '~',
          type:  'sub',
        },
      ],
      '[': [
        {
          open: '[',
          parser: this.linkParser,
        },
      ],
      '!': [
        {
          open: '![',
          parser: this.linkParser,
        },
      ],
    };

    const backslashCommands = [
      'sum',
      'int',
      'sqrt',
      'infty',
      'pi'
    ];

    line = line.trim();
    while (line) {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '\\') {
          i++;
          for (const command of backslashCommands) {
            if (line.substring(i, i + command.length) === command) {
              node = { type: 'command', command };
              i += command.length - 1;
              break;
            }
          }

          if (!node) {
            text += char + line[i];
            continue;
          }
        }

        if (!node) {
          let definitions = grouppedDefinitions[char];
          if (definitions) {
            for (const definition of definitions) {
              const openLength = definition.open.length;
              if (line.substring(i, i + openLength) === definition.open) {
                if (definition.close) {
                  let text = getDelimitedString(line.slice(i + openLength), definition.close, { escape: '\\' });
                  i += text.length + openLength + definition.close.length - 1;

                  let property = definition.property || 'content';
                  if (property === 'content')
                    text = this.parseLine(text);

                  node = { type: definition.type, [property]: text };
                  break;
                } else if (definition.parser) {
                  let res = definition.parser.call(this, line.slice(i), { detailed: true });
                  if (res.node) {
                    node = res.node;
                    i += res.length - 1;
                    break;
                  }
                }
              }
            }
          }
        }

        if (node) {
          if (text) {
            nodes.push({ type: 'text', text: text.trim() || ' ' });
            text = '';
          }

          nodes.push(node);
          node = null;

          continue;
        }

        text += char;
      }

      if (!options.multiline || !options.lines?.length)
        break;

      let isBlock = false;
      for (const parser of this.parsers) {
        if (parser.check(options.lines, { parser: this })) {
          isBlock = true;
          break;
        }
      }

      if (isBlock)
        break;

      line = options.lines.shift().trim();
      if (!line)
        break;
    }

    if (text)
      nodes.push({ type: 'text', text: text.trim() || ' ' });

    return nodes;
  }

  linkParser(line, options = {}) {
    let from = 0;

    if (line[from] === '!')
      from++;

    if (line[from] !== '[')
      return;

    from++;

    let node = {};
    let includeTarget = false;
    if (line[0] === '!') {
      node.type = 'image';
      includeTarget = true;
    } else if (line[from] === '^') {
      node.type = 'reference';
      node.refType = 'footnote';
      from++;
    } else if (line[from] === '@') {
      node.type = 'reference';
      node.refType = 'citation';
      from++;
    } else {
      node.type = 'link';
      includeTarget = true;
    }

    node.target = getDelimitedString(line.slice(from), ']', { escape: '\\' });
    from += node.target.length + 1;

    if (includeTarget) {
      node.text = node.target;
      if (line[from] === '(') {
        node.target = getDelimitedString(line.slice(from + 1), ')', { escape: '\\' });
        from += node.target.length + 2;
      }

      let parts = node.target.split(' "');
      if (parts.length > 1) {
        node.target = parts[0];
        node.title = parts.slice(1).join(' "').slice(0, -1);
      }
    }

    if (options.detailed) {
      return {
        node,
        length: from,
      };
    }

    return node;
  }
}

class HeadingParser {
  static #regExp = /^\s{0,3}(#+)\s+(.+)?$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    lines.shift();
    const level = matches[1].length;
    return {
      type: 'heading',
      level,
      content: options.parser.parseLine(matches[2], { multiline: true, lines }),
    };
  }
}

class RuleParser {
  static #regExp = /^\s{0,3}(---+|===+|\*\*\*+|\.\.\.+|≡≡≡+|___+|- - -|\. \. \.)/;
  
  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines) {
    const matches = this.check(lines);
    if (!matches)
      return;

    let pattern = matches[1].slice(0, 5);
    let variant = pattern === '- - -' ? 'dashed' :
      pattern === '. . .' ? 'dotted' :
      '';
      
    if (!variant) {
      pattern = matches[1].slice(0, 3);
      variant = pattern === '---' ? 'single' :
        pattern === '___' ? 'single' :
        pattern === '===' ? 'double' :
        pattern === '===' ? 'double' :
        pattern === '≡≡≡' ? 'triple' :
        pattern === '...' ? 'dotted' :
        pattern === '***' ? 'dotted2' :
        'single';
    }

    lines.shift();
    return { type: 'rule', variant };
  }
}

class ListParser {
  static #regExp = /^(\s*)(\*|\d+\.|\(@\)|-\s+\[[ xX]\])\s+(.+)$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }
  
  static parse(lines, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    const marker = matches[2];
    
    let listType = this.getListItemType(marker);
    if (!listType)
      return;
  
    const indent = matches[1].length;

    let nextItem;
    const content = [];
    while (nextItem = this.parseListItem(lines, indent, listType, options))
      content.push(nextItem);

    let node = {
      type: 'list',
      listType,
      content,
    };

    if (listType === 'ordered')
      node.start = 1;

    return node;
  }

  static getListItemType(marker) {
    if (marker === '*')
      return 'bullet';
    
    if (/\d+\./.test(marker))
      return 'ordered';
    
    if (marker === '(@)')
      return 'automatic';
    
    if (/-\s+\[[ xX]\]/.test(marker))
      return 'task';
  }

  static parseListItem(lines, indent, listType, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    let thisIndent = matches[1].length;
    if (thisIndent > indent)
      return this.parse(lines, options);

    if (thisIndent !== indent)
      return;

    let thisMarker = matches[2];
    let thisItemType = this.getListItemType(thisMarker);
    if (thisItemType !== listType)
      return this.parse(lines, options);

    lines.shift();
    
    let node = {
      type: 'list-item',
      content: options.parser.parseLine(matches[3], { multiline: true, lines }),
    };

    if (thisItemType === 'task') {
      node.checked = /\[[xX]\]/.test(thisMarker);
    }

    return node;
  }
}

class BlockquoteParser {
  static #regExp = /^\s{0,3}>\s+(.+)$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines, options = {}) {
    let matches = this.check(lines);
    if (!matches)
      return;

    let content = [];
    do {
      lines.shift();
      const thisLine = options.parser.parseLine(matches[1]);
      content.push(...thisLine);
    } while (matches = this.check(lines));
    
    return {
      type: 'blockquote',
      content,
    };
  }
}

class DefinitionsParser {
  static #ddRegExp = /^\s{0,3}:[^:]\s*(.+)$/;

  static check(lines) {
    if (this.#ddRegExp.test(lines[0]))
      return;

    return this.#ddRegExp.exec(lines[1]);
  }

  static parse(lines, options = {}) {
    let matches = this.check(lines);
    if (!matches)
      return;
    
    const term = lines[0].trim();
    if (!term)
      return;

    lines.shift();

    let node = {
      type: 'definition',
      term: options.parser.parseLine(term) ?? [term],
      definitions: [],
    };

    do {
      lines.splice(0, 1, matches[1]);
      const def = options.parser.parseSingleNode(lines, { closeRegExp: this.#ddRegExp, skipParser: this });
      node.definitions.push(def);
    } while (matches = this.#ddRegExp.exec(lines[0]));

    return node;
  }
}

class FootnoteParser {
  static #regExp = /^\s{0,3}\[\^([^\]]+)\]:\s+(.+)$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }
  
  static parse(lines, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    lines.shift();
    return {
      type: 'footnote',
      id: matches[1],
      content: options.parser.parseLine(matches[2], { multiline: true, lines }),
    };
  }
}

/*

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
}*/