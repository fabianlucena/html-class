import { getDelimitedString } from './string.js';

/**
 * Regla:
 * Todo texto almacenado en nodos text tiene los espacios iniciales y finales
 * normalizados a un único espacio.
 */

export default class MDParser {
  #parsers = [
    YamlParser,
    HeadingParser,
    RuleParser,
    ListParser,
    BlockquoteParser,
    FootnoteParser,
    DefinitionsParser,
    TableParser,
    CodeBlockParser,
    CustomBlockParser,
    PluginBlockParser,
  ];
  get parsers() {
    return this.#parsers;
  }

  #grouppedInlineParsers = {
    '`': [
      {
        open:  '`',
        close: '`',
        type:  'code',
        property: 'code',
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

  #inlineBackslashCommands = [
    'sum',
    'int',
    'sqrt',
    'infty',
    'pi'
  ];

  #blockParsers = [];
  get blockParsers() {
    return this.#blockParsers;
  }

  #plugins = [];
  get plugins() {
    return this.#plugins;
  }

  constructor(options = {}) {
    if (options.parsers)
      this.#parsers.push(...options.parsers);

    if (options.plugins)
      this.#plugins.push(...options.plugins);
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
      this.addParsers(plugin.parsers);
    }

    if (plugin.inline) {
      this.addInlineParsers(plugin.inline);
    }

    if (plugin.block) {
      this.addBlockParsers(plugin.block);
    }
  }

  addParsers(parsers) {
    for (const parser of parsers) {
      this.addParser(parser);
    }
  }

  addParser(parser) {
    this.#parsers.push(parser);
  }

  addInlineParsers(inlineParsers) {
    for (const inlineParser of inlineParsers) {
      this.addInlineParser(inlineParser);
    }
  }

  addInlineParser(inlineParser) {
    const char = inlineParser.open[0];
    if (!this.#grouppedInlineParsers[char]) {
      this.#grouppedInlineParsers[char] = [];
    }

    this.#grouppedInlineParsers[char].push(inlineParser);
  }

  addBlockParsers(blockParsers) {
    for (const blockParser of blockParsers) {
      this.addBlockParser(blockParser);
    }
  }

  addBlockParser(blockParser) {
    this.#blockParsers.push(blockParser);
  }

  parse(md) {
    const lines = md.split(/\n/gm);
    const doc = {
      type: 'document',
      content: [],
    };

    const metadata = this.parseSingleNode(lines);
    if (metadata)
      doc.metadata = metadata;

    doc.content.push(...this.parseLines(lines));

    console.log(doc);
    
    return doc;
  }

  parseLines(lines) {
    const nodes = [];
    while (lines.length) {
      const node = this.parseSingleNode(lines);
      if (!node)
        continue;
      
      nodes.push(node);
    }
    return nodes;
  }

  parseSingleNode(lines, { skipParser, closeRegExp } = {}) {
    let leadingLines = [];
    while (lines.length && !lines[0].trim())
      leadingLines.push(lines.shift());
    
    if (closeRegExp && closeRegExp.test(lines[0]))
      return;

    for (const parser of this.parsers) {
      if (skipParser && parser === skipParser)
        continue;

      const node = parser.parse(lines, { parser: this });
      if (node) {
        node.leadingLines = leadingLines;
        return node;
      }
    }

    let paragraphLines = [],
      line,
      rawLines = [],
      isNode;

    while (lines.length) {
      line = lines.shift();
      rawLines.push(line);
      paragraphLines.push(line.replace(/^\s+/, ' ').replace(/\s+$/, ' '));
      
      if (!lines[0].trim())
        break;

      for (const parser of this.parsers) {
        if (skipParser && parser === skipParser)
          continue;

        if (parser.check(lines, { parser: this })) {
          isNode = true;
          break;
        }
      }

      if (isNode)
        break;
    }

    return {
      type: 'paragraph',
      content: this.parseLine(paragraphLines.join(' ')),
      leadingLines,
      rawLines,
    };
  }

  parseLine(line, options = {}) {
    const nodes = [];
    let node;
    let text = '';

    line = line.replace(/^\s+/, ' ').replace(/\s+$/, ' ');
    while (line) {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '\\') {
          i++;
          for (const command of this.#inlineBackslashCommands) {
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
          let parsers = this.#grouppedInlineParsers[char];
          if (parsers) {
            for (const parser of parsers) {
              const openLength = parser.open.length;
              if (line.substring(i, i + openLength) === parser.open) {
                if (parser.close) {
                  let text = getDelimitedString(line.slice(i + openLength), parser.close, { escape: '\\' });
                  i += text.length + openLength + parser.close.length - 1;

                  let property = parser.property || 'content';
                  if (property === 'content')
                    text = this.parseLine(text);

                  node = { type: parser.type, [property]: text };
                  if (parser.variant)
                    node.variant = parser.variant;

                  if (parser.parser)
                    node = parser.parser.call(this, node, { detailed: true });

                  break;
                } else if (parser.parser) {
                  let res = parser.parser.call(this, line.slice(i), { detailed: true });
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
            let node = { type: 'text', text: text.replace(/^\s+/, ' ').replace(/\s+$/, ' ') || '' };
            node = this.applyPlugins(node);
            nodes.push(node);
            text = '';
          }

          node = this.applyPlugins(node);
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

    if (text) {
      let node = { type: 'text', text: text.replace(/^\s+/, ' ').replace(/\s+$/, ' ') || '' };
      node = this.applyPlugins(node);
      nodes.push(node);
    }

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
      node.type = 'ref';
      node.refType = 'footnote';
      from++;
    } else if (line[from] === '@') {
      node.type = 'ref';
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
        node.label = parts.slice(1).join(' "').slice(0, -1);
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

  applyPlugins(node) {
    for (const plugin of this.plugins) {
      node = plugin(node);
    }
    
    return node;
  }
}

class YamlParser {
  static beginYamlRegExp = /^\s{0,3}---\s*$/;
  static endYamlRegExp = /^\s{0,3}---\s*$/;
  static kvReExp = /^\s{0,3}([a-zA-Z0-9_-]+):\s*(.*)$/;
  static multiLineRegExp = /^\s{0,3}([a-zA-Z0-9_-]+):\s*\|\s*(.*)$/;

  static check(lines) {
    let i = 0,
      beginLine;
    if (this.beginYamlRegExp.test(lines[i])) {
      beginLine = true;
      i++;
    }

    let multilineValue = false, data;
    while (lines[i]) {
      while (i < lines.length && !lines[i].trim())
        i++;
      
      if (beginLine && this.endYamlRegExp.test(lines[i])) {
        i++;
        break;
      }

      if (this.multiLineRegExp.test(lines[i])) {
        multilineValue = true;
        data = true;
      } else if (this.kvReExp.test(lines[i])) {
        multilineValue = false;
        data = true;
      } else if (!multilineValue) {
        if (beginLine)
          return;

        break;
      }

      i++;
    }

    if (!i)
      return;

    if (!data)
      return;

    return lines.slice(0, i);
  }

  static parse(lines) {
    const rawLines = this.check(lines);
    if (!rawLines)
      return;

    lines.splice(0, rawLines.length);

    let
      i = 0,
      match,
      data = {},
      multilineKey = false,
      beginLine = false,
      endLine = false,
      error;

    while (i < rawLines.length && !rawLines[i].trim())
      i++;

    if (this.beginYamlRegExp.test(rawLines[i])) {
      i++;
      beginLine = true;
    }

    while (rawLines[i]) {
      while (i < rawLines.length && !rawLines[i].trim())
        i++;

      if (beginLine && this.endYamlRegExp.test(rawLines[i])) {
        endLine = true;
        i++;
        break;
      }

      if (match = this.multiLineRegExp.exec(rawLines[i])) {
        multilineKey = match[1].trim();
        data[multilineKey] = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      } else if (match = this.kvReExp.exec(rawLines[i])) {
        multilineKey = false;
        const key = match[1].trim();
        const value = match[2].trim();

        data[key] = value.replace(/^["'](.*)["']$/, '$1');
        multilineKey = null;
      } else if (multilineKey && (match = /^\s{2,}(.*)$/.exec(rawLines[i]))) {
        data[multilineKey] += (data[multilineKey] ? '\n' : '') + rawLines[i].trim();
      } else {
        if (beginLine)
          error = new Error('Invalid YAML format');

        break;
      }

      i++;
    }

    const node = {
      type: 'data',
      data,
      beginLine,
      endLine,
      rawLines,
    };

    if (error)
      node.error = error;

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
      rawLines: [matches[0]],
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

    lines.shift();
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

    return {
      type: 'rule',
      rawLines: [matches[0]],
      variant,
    };
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
      ordered: listType === 'ordered' || listType === 'automatic',
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

class TableParser {
  static #regExp = /^\s{0,3}\|\s*(.+)\s*\|$/;
  static #separatorRegExp = /^\s{0,3}\|\s*(:?-+:?\s*\|)+\s*$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines, options = {}) {
    let matches = this.check(lines);
    if (!matches)
      return;

    const tableNode = {
      type: 'table',
      bodies: [],
    };

    let bodyNode;

    do {
      const line = lines.shift();
      const cells = matches[1].split('|');

      if (this.#separatorRegExp.test(line)) {
        if (typeof tableNode.head === 'undefined') {
          if (tableNode.bodies.length) {
            tableNode.head = tableNode.bodies.shift();
            tableNode.head.type = 'table-head';
          } else {
            tableNode.head = null;
          }
        }

        bodyNode = {
          type: 'table-body',
          rows: [],
          columns: [],
        };
        tableNode.bodies.push(bodyNode);

        for (let i = 0; i < cells.length; i++) {
          let cell = cells[i].trim();
          const columnNode = {
            type: 'table-column',
          };
          bodyNode.columns.push(columnNode);
          if (cell.startsWith(':')) {
            if (cell.endsWith(':')) {
              columnNode.align = 'center';
            } else {
              columnNode.align = 'left';
            }
          } else if (cell.endsWith(':')) {
            columnNode.align = 'right';
          }
        }
      } else {
        if (!bodyNode) {
          bodyNode = {
            type: 'table-body',
            rows: [],
          };
          tableNode.bodies.push(bodyNode);
        }
        
        const rowNode = {
          type: 'table-row',
          cells: [],
        };
        let iRow = bodyNode.rows.length;
        bodyNode.rows.push(rowNode);

        let cellNode;
        for (let i = 0; i < cells.length; i++) {
          let cell = cells[i].trim();
          if (cellNode && cell === '>') {
            cellNode.colSpan ??= 1;
            cellNode.colSpan++;
            continue;
          }

          if (iRow > 0 && cell === '^') {
            let upperRow = bodyNode.rows[iRow - 1];
            if (upperRow) {
              let iUpperCell = 0;
              for (let j = 0; j < upperRow.cells.length; j++) {
                iUpperCell += upperRow.cells[j].colSpan ?? 1;
                if (iUpperCell >= i)
                  break;
              }

              let upperCell = upperRow.cells[iUpperCell];
              upperCell.rowSpan ??= 1;
              upperCell.rowSpan++;
              continue;
            }
          }

          cellNode = {
            type: 'table-cell',
          };
          rowNode.cells.push(cellNode);
          if (cell.startsWith(':')) {
            if (cell.endsWith(':')) {
              cellNode.align = 'center';
              cell = cell.slice(1, -1).trim();
            } else {
              cellNode.align = 'left';
              cell = cell.slice(1).trim();
            }
          } else if (cell.endsWith(':')) {
            cellNode.align = 'right';
            cell = cell.slice(0, -1).trim();
          }

          cellNode.content = options.parser.parseLine(cell, { multiline: true, lines });
        }
      }

    } while (matches = this.check(lines));

    if (!tableNode.foot && tableNode.bodies.length > 1) {
      tableNode.foot = tableNode.bodies.pop();
      tableNode.foot.type = 'table-foot';
      if (tableNode.foot.rows.length === 0)
        tableNode.foot = null;
    }

    return tableNode;
  }
}

class CodeBlockParser {
  static #regExp = /^\s{0,3}```\s*(\w+)?\s*(\{[^\}]+\})?\s*$/;
  static #endRegExp = /^\s{0,3}```\s*$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    lines.shift();
    let lang = matches[1] || '';
    let attrs = matches[2] || '';
    let codeLines = [];
    do {
      const line = lines.shift();
      if (this.#endRegExp.test(line)) 
        break;

      codeLines.push(line);
    } while (lines.length);
    
    let node = {
      type: 'code-block',
      lang,
      attrs,
      code: codeLines.join('\n'),
    };

    return node;
  }
}

class CustomBlockParser {
  static #regExp = /^\s{0,3}:{3}(?:\s+(.+))?\s*$/;
  static #endRegExp = /^\s{0,3}:{3}\s*$/;

  static check(lines) {
    return this.#regExp.exec(lines[0]);
  }

  static parse(lines, options = {}) {
    const matches = this.check(lines);
    if (!matches)
      return;

    lines.shift();
    let blockNodes = [];
    do {
      const node = options.parser.parseSingleNode(lines, { closeRegExp: this.#endRegExp });
      if (!node)
        break;

      blockNodes.push(node);
    } while (lines[0] && !this.#endRegExp.test(lines[0]));

    while (lines.length && !lines[0].trim())
      lines.shift();

    if (lines[0] && this.#endRegExp.test(lines[0]))
      lines.shift();
    
    let variant = '';
    const attr = [];
    const blockType = matches[1] ? matches[1].trim() : '';
    const optionsMatches = /\{(.+)\}/.exec(blockType);
    if (optionsMatches) {
      optionsMatches[1].split(/\s+/).forEach(option => {
        if (option.startsWith('.')) {
          attr.className = option.slice(1);
        }
      });
    } else if (blockType) {
      variant = blockType.toLocaleLowerCase();
    }
    
    const node = {
      type: 'custom-block',
      variant,
      attrs: attr,
      content: blockNodes,
    };

    return node;
  }
}

class PluginBlockParser {
  static check(lines, { parser } = {}) {
    let line = lines[0], matches;
    for (const testBlock of parser.blockParsers) {
      if (matches = testBlock.open.exec(line)) {
        return matches;
      }
    }
  }

  static parse(lines, { parser } = {}) {
    let block;
    let line = lines[0], matches;
    for (const testBlock of parser.blockParsers) {
      if (matches = testBlock.open.exec(line)) {
        block = testBlock;
        line = matches[1];
        break;
      }
    }

    if (!block)
      return;

    lines.shift();

    const rawLines = [];

    do {
      if (matches = block.close.exec(line)) {
        if (matches[1])
          rawLines.push(matches[1]);

        if (matches[2])
          rawLines.push(matches[2]);

        break;
      }

      rawLines.push(line);
      line = lines.shift();
    } while (lines.length);
    
    const property = block.property || 'raw';
    let node = {
      type: block.type,
      [property]: rawLines.join('\n'),
    };

    if (block.variant)
      node.variant = block.variant;

    node = block.parser(node);

    return node;
  }
}