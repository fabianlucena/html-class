export function MathParserMDPlugin(node) {
  if (node.type !== 'math' || node.content || !node.raw)
    return node;

  const newNode = parser.parse(node.raw, { display: node.variant ? 'block' : 'inline' });
  newNode.raw = node.raw;

  return newNode;
}

export default class MathParser {
  #words = ['sin', 'cos', 'tan', 'log', 'ln', 'lim', 'max', 'min', 'exp', 'mod', 'gcd', 'lcm', 'det', 'dim', 'arg', 'ker', 'deg', 'hom', 'span', 'div', 'curl', 'grad'];
  #commandsMap = {
    '\\sum': {
      type: 'operator',
      symbol: 'sum',
      children: 1,
    },
    '\\prod': {
      type: 'operator',
      symbol: 'prod',
      children: 1,
    },
    '\\int': {
      type: 'operator',
      symbol: 'int',
      children: 1,
    },
    '\\oint': {
      type: 'operator',
      symbol: 'oint',
      children: 1,
    },
    '\\sqrt': {
      type: 'operator',
      symbol: 'sqrt',
      children: 1,
      optionalPreChildren: {
        open: '[',
        close: ']',
        property: 'index',
      },
    },
    '\\frac': {
      type: 'operator',
      symbol: 'frac',
      children: 2,
      properties: ['numerator', 'denominator'],
    },
    '\\coprod': {
      type: 'operator',
      symbol: 'coprod',
      children: 1,
    },
    '\\bigcup': {
      type: 'operator',
      symbol: 'bigcup',
      children: 1,
    },
    '\\bigcap': {
      type: 'operator',
      symbol: 'bigcap',
      children: 1,
    },
    '\\bigvee': {
      type: 'operator',
      symbol: 'bigvee',
      children: 1,
    },
    '\\bigwedge': {
      type: 'operator',
      symbol: 'bigwedge',
      children: 1,
    },
    '\\overline': {
      type: 'decoration',
      symbol: 'overline',
      children: 1,
    },
    '\\underline': {
      type: 'decoration',
      symbol: 'underline',
      children: 1,
    },
    '\\overbrace': {
      type: 'decoration',
      symbol: 'overbrace',
      children: 1,
    },
    '\\underbrace': {
      type: 'decoration',
      symbol: 'underbrace',
      children: 1,
    },
    '\\hat': {
      type: 'decoration',
      symbol: 'hat',
      children: 1,
    },
    '\\widehat': {
      type: 'decoration',
      symbol: 'widehat',
      children: 1,
    },
    '\\tilde': {
      type: 'decoration',
      symbol: 'tilde',
      children: 1,
    },
    '\\widetilde': {
      type: 'decoration',
      symbol: 'widetilde',
      children: 1,
    },
    '\\dot': {
      type: 'decoration',
      symbol: 'dot',
      children: 1,
    },
    '\\ddot': {
      type: 'decoration',
      symbol: 'ddot',
      children: 1,
    },
    '\\vec': {
      type: 'decoration',
      symbol: 'vec',
      children: 1,
    },
    '\\overrightarrow': {
      type: 'decoration',
      symbol: 'overrightarrow',
      children: 1,
    },
    '\\overleftarrow': {
      type: 'decoration',
      symbol: 'overleftarrow',
      children: 1,
    },
    '\\bar': {
      type: 'decoration',
      symbol: 'bar',
      children: 1,
    },
    '\\lim': {
      type: 'operator',
      symbol: 'lim',
    },
  };
  #groupSymbols = {
    '\\{': {
      open: '{',
      close: '}',
    },
    '(': ')',
    '[': ']',
    '|': '|',
    '<': '>',
    'lbracket': 'rbracket',
    'lbrace': 'rbrace',
    'langle': 'rangle',
  };
  #operatorSymbols = ['+', '-', '*', '/', '=', '<', '>', '^', '_', '!', '%', '&', '|', ':', ';', ',', '.', '?'];
  #blockEnv = {
    'array':   { type: 'matrix', variant: 'array',   open: '',  close: '' },
    'matrix':  { type: 'matrix', variant: 'matrix',  open: '',  close: '' },
    'pmatrix': { type: 'matrix', variant: 'pmatrix', open: '(', close: ')' },
    'bmatrix': { type: 'matrix', variant: 'bmatrix', open: '[', close: ']' },
    'Bmatrix': { type: 'matrix', variant: 'Bmatrix', open: '{', close: '}' },
    'pmatrix': { type: 'matrix', variant: 'pmatrix', open: '(', close: ')' },
    'vmatrix': { type: 'matrix', variant: 'vmatrix', open: '|', close: '|' },
    'Vmatrix': { type: 'matrix', variant: 'Vmatrix', open: '|', close: '|' },
    'cases':   { type: 'matrix', variant: 'cases',   open: '{', close: '' },
  };

  parse(raw, options = {}) {
    const tokens = this.tokenize(raw);
    //console.log([...tokens]);
    const node = {
      type: 'math',
      ...options,
      body: this.parseTokens(tokens),
    };
    //console.log(node);
    //console.log(JSON.stringify(node, null, 2));
    return node;
  }

  tokenize(raw) {
    const tokens = [];

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];

      if (/\s/.test(char))
        continue;

      if (char === '\\') {
        let cmd = '\\';
        i++;

        let matches;
        if (matches = /^(begin|end)\{([^}]*)\}(?:\{([^}]*)\})?/.exec(raw.slice(i))) {
          tokens.push({ type: 'COMMAND', value: '\\' + matches[1], env: matches[2], align: matches[3] });
          i += matches[0].length - 1;
        } else if (i < raw.length && (raw[i] === '{' || raw[i] === '}')) {
          cmd += raw[i];
          i++;
          tokens.push({ type: 'SYMBOL', value: cmd });
        } else if (raw[i] === '\\') {
          cmd += raw[i];
          i++;
          tokens.push({ type: 'SYMBOL', value: cmd });
        } else {
          while (i < raw.length && /[a-zA-Z]/.test(raw[i])) {
            cmd += raw[i];
            i++;
          }
          i--;
          tokens.push({ type: 'COMMAND', value: cmd });
        }
      } else if (/[0-9]/.test(char)) {
        let word = '';
        while (i < raw.length && /[0-9]/.test(raw[i])) {
          word += raw[i];
          i++;
        }
        i--;

        const token = { type: 'NUMBER', value: word };
        tokens.push(token);
      } else if (/[a-zA-Z]/.test(char)) {
        let word = '';
        while (i < raw.length && /[a-zA-Z]/.test(raw[i])) {
          word += raw[i];
          i++;
        }
        i--;

        if (this.#words.includes(word)) {
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

  parseTokens(tokens, { single = false, end, skipSup, skipSub } = {}) {
    let currentCommand, node;
    const nodes = [];
    while (tokens.length) {
      currentCommand = null;
      let token = tokens.shift();

      if (end && token.type === end.type && token.value === end.value)
        break;

      if (token.type === 'IDENTIFIER') {
        node = {
          type: 'identifier',
          value: token.value,
        };
      } else if (token.type === 'NUMBER') {
        node = {
          type: 'number',
          value: token.value,
        };
      } else if (token.type === 'SYMBOL') {
        if (token.value === '{') {
          let body = this.parseTokens(tokens, { end: { type: 'SYMBOL', value: '}' } });

          if (single) {
            nodes.push(...body);
          } else {
            node = {
              type: 'group',
              body,
            };            
          }
        } else {
          let close = this.#groupSymbols[token.value];
          if (close) {
            let open;
            if (typeof close === 'object') {
              open = close.open ?? token.value;
              close = close.close ?? close;
            } else {
              open = token.value;
            }

            let body = this.parseTokens(tokens, { end: { type: 'SYMBOL', value: close } });
            node = {
              type: 'group',
              open,
              close,
              body,
            };
          } else {
            node = {
              type: this.#operatorSymbols.includes(token.value) ? 'operator' : 'symbol',
              symbol: token.value,
            };
          }
        }
      } else if (token.type === 'COMMAND') {
        currentCommand = this.#commandsMap[token.value];

        if (!currentCommand && token.value === '\\begin') {
          let block = this.#blockEnv[token.env] || { open: '', close: '' };
          node = {
            type: block.type ?? token.env,
            rows: [],
          };

          if (block.variant)
            node.variant = block.variant;

          if (block.open)
            node.open = block.open;

          if (block.close)
            node.close = block.close;

          if (token.align)
            node.align = token.align?.split('');

          let row = [];
          do {
            row.push(...this.parseTokens(tokens, { single: true, end: { type: 'COMMAND', value: '\\end', env: token.env } }));
            if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '\\\\') {
              tokens.shift();
              node.rows.push(row);
              row = [];
            }

            if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '&')
              tokens.shift();
          } while (tokens[0]?.type !== 'COMMAND' || tokens[0]?.value !== '\\end' || tokens[0]?.env !== token.env);
          
          if (row.length > 0)
            node.rows.push(row);

          tokens.shift();
        } else {
          if (!currentCommand) {
            currentCommand = {
              type: 'symbol',
              symbol: token.value.slice(1),
            };
          }

          node = {
            type: currentCommand?.type ?? 'command',
            symbol: currentCommand?.symbol ?? token.value,
          };
          
          if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
            tokens.shift();
            node.sub = this.parseTokens(tokens, { single: true });
          }

          if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '^') {
            tokens.shift();
            node.sup = this.parseTokens(tokens, { single: true });
          }
          
          if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
            tokens.shift();
            node.sub = this.parseTokens(tokens, { single: true });
          }

          if (currentCommand?.optionalPreChildren) {
            const { open, close, property } = currentCommand.optionalPreChildren;
            if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === open) {
              tokens.shift();
              
              property ??= 'body';
              node[property] = this.parseTokens(tokens, { single: true, end: { type: 'SYMBOL', value: close } });
              tokens.shift();
            }
          }
          
          if (currentCommand?.children) {
            for (let i = 0; i < currentCommand.children; i++) {
              const child = this.parseTokens(tokens, { single: true });
              const property = currentCommand.properties?.[i] ?? 'body';
              if (node[property] === undefined) {
                node[property] = child;
              } else {
                if (!Array.isArray(node[property])) {
                  node[property] = [node[property]];
                }
                node[property].push(...child);
              }
            }
          }
        }
      } else {
        console.warn('Unknown token type:', token.type, 'with value:', token.value);
      }

      if (node) {
        if (!skipSub && tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
          tokens.shift();
          node.sub = this.parseTokens(tokens, { single: true, skipSup: true });
        }

        if (!skipSup && tokens[0]?.type === 'SYMBOL' && tokens[0].value === '^') {
          tokens.shift();
          node.sup = this.parseTokens(tokens, { single: true });
        }

        if (!skipSub && tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
          tokens.shift();
          node.sub = this.parseTokens(tokens, { single: true, skipSup: true });
        }
        
        nodes.push(node);
        node = null;
      }

      if (single)
        break;
    }

    return nodes;
  }
}

const parser = new MathParser();
