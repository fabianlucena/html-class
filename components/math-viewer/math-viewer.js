import Base from '../utils/base.js';

export function mathRenderMdPlugin(md, node, parentElement) {
  if (!md.checkNodeAndParent(node, parentElement, 'math'))
    return;

  const mathElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
  mathElement.setAttribute('display', 'block');
  parentElement.appendChild(mathElement);

  console.log(node);

  mathViewer.renderNodes(node.body, mathElement);
}

export default class MathViewer extends Base {
  #nodeRenderers = {
    'identifier': this.renderIdentifier.bind(this),
    'symbol': this.renderSymbol.bind(this),
    'number': this.renderNumber.bind(this),
    'group': this.renderGroup.bind(this),
    'operator': this.renderOperator.bind(this),
  };
  #operators = {
    'sum': '&sum;',
    'int': '&int;',
    'sqrt': {
      tag: 'msqrt',
    },
  };
  #symbols = {
    'infty': '&infin;',
    'pi': '&pi;',
    'pm': '&plusmn;',
  };

  renderError(message, parentElement) {
    if (!message || !parentElement)
      return;

    console.error(message);

    let errorElement = document.createElement('div');
    errorElement.classList.add('error');
    errorElement.textContent = message;
    parentElement.appendChild(errorElement);
  }

  checkNodeAndParent(node, parentElement, type) {
    if (!parentElement)
      throw new Error('El elemento padre es nulo o indefinido.');
    
    if (!node)
      this.renderError('El nodo es nulo o indefinido.', parentElement);

    if (type && node?.type !== type)
      this.renderError(`El tipo de nodo recibido "${node?.type}" no es el esperado: ${type}.`, parentElement);

    return true;
  }

  renderNodes(nodes, parentElement) {
    if (!parentElement)
      throw new Error('El elemento padre es nulo o indefinido.');
    
    if (!nodes)
      throw new Error('El contenido de los nodos es nulo o indefinido.');

    if (!Array.isArray(nodes)) {
      this.renderNode(nodes, parentElement);
      return;
    }
    
    if (!nodes?.length)
      return;

    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
    parentElement.appendChild(element);

    for (const node of nodes)
      this.renderNode(node, element);

    return { element };
  }

  renderNode(node, parentElement) {
    if (!this.checkNodeAndParent(node, parentElement))
      return;

    if (Array.isArray(node)) {
      return this.renderNodes(node, parentElement);
    }

    const renderer = this.#nodeRenderers[node.type];
    if (!renderer) {
      this.renderError('Tipo de elemento desconocido: ' + node.type, parentElement);
      return;
    }

    const element = renderer(node, parentElement);

    if (node.sub) {
      if (node.sup) {
        const subElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', element.subsup || 'msubsup');
        parentElement.appendChild(subElement);
        subElement.appendChild(element.element);
        
        const subChild = this.renderNode(node.sub, parentElement);
        subElement.appendChild(subChild.element);

        const supChild = this.renderNode(node.sup, parentElement);
        subElement.appendChild(supChild.element);
      } else {
        const subElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', element.sub || 'msub');
        parentElement.appendChild(subElement);
        subElement.appendChild(element.element);
        
        const subChild = this.renderNode(node.sub, parentElement);
        subElement.appendChild(subChild.element);
      }
    } else if (node.sup) {
      const supElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', element.sup || 'msup');
      parentElement.appendChild(supElement);
      supElement.appendChild(element.element);

      const supChild = this.renderNode(node.sup, parentElement);
      supElement.appendChild(supChild.element);
    } else {
      parentElement.appendChild(element.element);
    }

    if (node.body && !element.skipBody) {
      const bodyChild = this.renderNode(node.body, parentElement);
      element.element.appendChild(bodyChild.element);
    }
  }

  renderIdentifier(node) {
    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
    element.textContent = node.value;
    return { element };
  }

  renderSymbol(node) {
    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
    element.innerHTML = this.#symbols[node.symbol] || node.symbol;
    return { element };
  }

  renderNumber(node) {
    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mn');
    element.textContent = node.value;
    return { element };
  }

  renderGroup(node) {
    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
    const child = this.renderNodes(node.body, element);
    if (node.open)
      element.appendChild(document.createTextNode(node.open));
    element.appendChild(child.element);
    if (node.close)
      element.appendChild(document.createTextNode(node.close));
    return { element, skipBody: true };
  }

  renderOperator(node) {
    let element;
    const op = this.#operators[node.symbol];
    if (op && op.tag) {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', op.tag);
    } else {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
      element.innerHTML = op || node.symbol;
    }

    return {
      element,
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    }
  }
}

const mathViewer = new MathViewer();

/*
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
*/