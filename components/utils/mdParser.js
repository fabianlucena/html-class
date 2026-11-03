import { getDelimitedString } from './string.js';

export default class MDParser {
  #parsers = [
    this.headingParser,
    this.ruleParser,
    this.listParser,
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
        const node = parser.call(this, lines);
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

  parseLine(line) {
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

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '\\') {
        i++;
        for (const command of backslashCommands) {
          if (line.substring(i, i + command.length) === command) {
            node = { type: 'command', command };
            i += command.length;
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
                i += text.length + openLength + definition.close.length;

                let property = definition.property || 'content';
                if (property === 'content')
                  text = this.parseLine(text);

                node = { type: definition.type, [property]: text };
                break;
              } else if (definition.parser) {
                let res = definition.parser.call(this, line.slice(i), { detailed: true });
                if (res.node) {
                  node = res.node;
                  i += res.length;
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

    if (text)
      nodes.push({ type: 'text', text: text.trim() || ' ' });

    return nodes;
  }

  headingParser(lines) {
    const regExp = /^\s{0,3}(#+)\s+(.+)?$/;
    const matches = regExp.exec(lines[0]);
    if (!matches)
      return;

    lines.shift();
    const level = matches[1].length;
    return {
      type: 'heading',
      level,
      content: this.parseLine(matches[2]),
    };
  }

  ruleParser(lines) {
    const regExp = /^\s{0,3}(---+|===+|\*\*\*+|\.\.\.+|≡≡≡+|___+|- - -|\. \. \.)/;
    const matches = regExp.exec(lines[0]);
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

  #listItemRegExp = /^(\s*)(\*|\d+\.|\(@\)|-\s+\[[ xX]\])\s+(.+)$/;
  listParser(lines) {
    const line = lines[0];
    const matches = this.#listItemRegExp.exec(line);
    if (!matches)
      return;

    const marker = matches[2];
    
    let listType = this.getListItemType(marker);
    if (!listType)
      return;
  
    const indent = matches[1].length;

    let nextItem;
    const content = [];
    while (nextItem = this.parseListItem(lines, indent, listType))
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

  getListItemType(marker) {
    if (marker === '*')
      return 'bullet';
    
    if (/\d+\./.test(marker))
      return 'ordered';
    
    if (marker === '(@)')
      return 'automatic';
    
    if (/-\s+\[[ xX]\]/.test(marker))
      return 'task';
  }

  parseListItem(lines, indent, listType) {
    const matches = this.#listItemRegExp.exec(lines[0]);
    if (!matches)
      return;

    let thisIndent = matches[1].length;
    if (thisIndent > indent)
      return this.listParser(lines);

    if (thisIndent !== indent)
      return;

    let thisMarker = matches[2];
    let thisItemType = this.getListItemType(thisMarker);
    if (thisItemType !== listType)
      return this.listParser(lines);

    lines.shift();

    let content = this.parseLine(matches[3]);

    let node = {
      type: 'list-item',
      content,
    };

    if (thisItemType === 'task') {
      node.checked = /\[[xX]\]/.test(thisMarker);
    }

    return node;
  }
}