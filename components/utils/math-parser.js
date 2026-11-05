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
      symbol: 'sum',
      sub: true,
      sup: true,
      children: 1,
    },
    '\\int': {
      symbol: 'int',
      sub: true,
      sup: true,
      children: 1,
    },
    '\\sqrt': {
      symbol: 'sqrt',
      children: 1,
    },
    '\\infty': {
      symbol: 'infty',
    },
    '\\pi': {
      symbol: 'pi',
    },
    '\\pm': {
      symbol: 'plusmn',
    },
    '\\frac': {
      symbol: 'frac',
      children: 2,
    },
  };

  parse(raw) {
    const tokens = this.tokenize(raw);
    //console.log([...tokens]);
    const node = {
      type: 'math',
      content: this.parseTokens(tokens),
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
        while (i < raw.length && /[a-zA-Z]/.test(raw[i])) {
          cmd += raw[i];
          i++;
        }
        i--;
        tokens.push({ type: 'COMMAND', value: cmd });
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

  parseTokens(tokens, { single = false, end } = {}) {
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
      } else if (token.type === 'COMMAND') {
        currentCommand = this.#commandsMap[token.value];

        node = {
          type: 'command',
          symbol: currentCommand.symbol ?? (token.value + 555),
        };
        
        if (currentCommand) {
          if (currentCommand.sub || currentCommand.sup) {
            if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '_') {
              tokens.shift();
              node.sub = this.parseTokens(tokens, { single: true });
            }
            if (tokens[0]?.type === 'SYMBOL' && tokens[0].value === '^') {
              tokens.shift();
              node.sup = this.parseTokens(tokens, { single: true });
            }
          }
        
          if (currentCommand.children) {
            node.content = [];
            for (let i = 0; i < currentCommand.children; i++) {
              const child = this.parseTokens(tokens, { single: true });
              node.content.push(child);
            }
          }
        }
      } else if (token.type === 'SYMBOL') {
        if (token.value === '{') {
          let content = this.parseTokens(tokens, { end: { type: 'SYMBOL', value: '}' } });

          if (single) {
            nodes.push(...content);
          } else {
            node = {
              type: 'group',
              content,
            };            
          }
        } else {
          node = {
            type: 'symbol',
            symbol: token.value,
            content: [],
          };
          
          if (token.value === '^') {
            node.content = this.parseTokens(tokens, { single: true });
          } else if (token.value === '_') {
            node.content = this.parseTokens(tokens, { single: true });
          }
        }
      } else {
        console.warn('Unknown token type:', token.type, 'with value:', token.value);
      }

      if (node) {
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
