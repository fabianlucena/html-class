import { getDelimitedString } from './string.js';

export default class MDParser {
  #parsers = [
    HeadingParser,
    RuleParser,
    ListParser,
    FootnoteParser,
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

  parseSingleNode(lines) {
    let paragraphLines = [];
    while (lines.length) {
      for (const parser of this.parsers) {
        const node = parser.parse(lines, { parser: this });
        if (node)
          return node;
      }

      const line = lines.shift().trim();
      if (!line) {
        if (!paragraphLines.length)
          continue;

        return { type: 'paragraph', content: this.parseLine(paragraphLines.join(' ')) };
      } else {
        paragraphLines.push(line);
      }
    }
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

      for (const parser of this.parsers) {
        const node = parser.check(options.lines, { parser: this });
        if (node)
          return node;
      }
      
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
      content: options?.parser?.parseLine(matches[2], { multiline: true, lines }) ?? matches[2],
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
      content: options?.parser?.parseLine(matches[3], { multiline: true, lines }) ?? matches[3],
    };

    if (thisItemType === 'task') {
      node.checked = /\[[xX]\]/.test(thisMarker);
    }

    return node;
  }
}

/* class 
  blockquoteParser(lines) {
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
*/
  // mdDefinitions2Html

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
      content: options?.parser?.parseLine(matches[2], { multiline: true, lines }) ?? matches[2],
    };
  }
}