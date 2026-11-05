export function MathParserMDPlugin(node) {
  if (node.type !== 'math' || node.content || !node.raw)
    return node;

  const newNode = parser.parse(node.raw);
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
    },
    '\\frac': {
      type: 'operator',
      symbol: 'frac',
      children: 2,
      properties: ['numerator', 'denominator'],
    },
    '\\oint': {
      type: 'operator',
      symbol: 'oint',
      children: 1,
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

  parse(raw) {
    const tokens = this.tokenize(raw);
    console.log([...tokens]);
    const node = {
      type: 'math',
      body: this.parseTokens(tokens),
    };
    console.log(node);
    console.log(JSON.stringify(node, null, 2));
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
        if (i < raw.length && (raw[i] === '{' || raw[i] === '}')) {
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
