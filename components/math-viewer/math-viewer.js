import Base from '../utils/base.js';
import { mathParserMDPlugin } from '../utils/math-parser.js';

export function mathRenderMdPlugin() {
  return {
    name: 'math',
    renderer: mathRenderMdPluginRenderer,
  };
}

export function mathRenderMdPluginRenderer({ md, node, parentElement }) {
  if (!md.checkNodeAndParent(node, parentElement, 'math'))
    return;

  mathViewer.render(node, parentElement);
}

export function mathMDViewerPlugin() {
  return {
    parsers: [ mathParserMDPlugin() ],
    renderers: [ mathRenderMdPlugin() ],
  };
}

export default class MathViewer extends Base {
  #nodeRenderers = {
    'identifier': this.renderIdentifier.bind(this),
    'symbol': this.renderSymbol.bind(this),
    'number': this.renderNumber.bind(this),
    'group': this.renderGroup.bind(this),
    'operator': this.renderOperator.bind(this),
    'matrix': this.renderMatrix.bind(this),
    'frac': this.renderFraction.bind(this),
  };
  #operators = {
    'sum': {
      symbol: '&sum;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'lim': {
      sub: 'munder',
    },
    'int': {
      symbol: '&int;',
    },
    'sqrt': {
      tag: 'msqrt',
      bodyAsChild: true,
    },
    'root': {
      render: this.renderRoot.bind(this),
      bodyAsChild: true,
    },
    'frac': { render: this.renderFraction.bind(this),
    },
    'max': {
      symbol: '&max;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'min': {
      symbol: '&min;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'sup': {
      symbol: '&sup;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'inf': {
      symbol: '&inf;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'sum': {
      symbol: '&sum;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'prod': {
      symbol: '&prod;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'coprod': {
      symbol: '&coprod;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'bigcup': {
      symbol: '&bigcup;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'bigcap': {
      symbol: '&bigcap;',
        sub: 'munder',
        sup: 'mover',
        subsup: 'munderover',
    },
    'bigvee': {
      symbol: '&bigvee;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
    'bigwedge': {
      symbol: '&bigwedge;',
      sub: 'munder',
      sup: 'mover',
      subsup: 'munderover',
    },
  };
  #symbols = {
    'infty': '&infin;',
    'pi': '&pi;',
    'pm': '&plusmn;',
    'to': '&rarr;',
  };

  render(node, parentElement) {
    const mathElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    if (node.display)
      mathElement.setAttribute('display', node.display);
    parentElement.appendChild(mathElement);

    this.renderNodes(node.body, mathElement);
  }

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
    
    if (!nodes) {
      this.renderError('El contenido de los nodos es nulo o indefinido.', parentElement);
      return;
    }

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
      console.error(node);
      return;
    }

    let element = renderer(node, parentElement);

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

      if (element.bodyAsChild) {
        element.element.appendChild(bodyChild.element);
      } else {
        const bodyElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
        parentElement.appendChild(bodyElement);
        bodyElement.appendChild(bodyChild.element);

        element = bodyElement;
      }
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
    if (op) {
      if (op.render) {
        return op.render(node);
      } else if (op.tag) {
        element = document.createElementNS('http://www.w3.org/1998/Math/MathML', op.tag);
      }
    }

    if (!element) {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
      element.innerHTML = op?.symbol ? op.symbol
        : (typeof op === 'string') ? op
        : node.symbol;
    }

    const result = { ...op, element };

    return result;
  }

  renderRoot(node) {
    let element;
    if (node.index) {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mroot');
      this.renderNode(node.body, element);
      this.renderNode(node.index, element);
    } else {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'msqrt');
      this.renderNode(node.body, element);
    }

    return { element, skipBody: true };
  }

  renderFraction(node) {
    const element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mfrac');

    const numerator = this.renderNode(node.numerator, element);
    element.appendChild(numerator.element);

    const denominator = this.renderNode(node.denominator, element);
    element.appendChild(denominator.element);
    
    return { element, skipBody: true };
  }

  renderMatrix(node) {
    let element, tableElement;

    if (node.open || node.close) {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');

      if (node.open) {
        const openElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
        openElement.textContent = node.open;
        element.appendChild(openElement);
      }

      tableElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mtable');
      element.appendChild(tableElement);
      tableElement.textContent = node.value;
    } else {
      element = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mtable');
      element.textContent = node.value;

      tableElement = element;
    }

    node.rows.forEach(row => {
      const rowElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mtr');
      tableElement.appendChild(rowElement);
      row.forEach(cell => {
        const cellElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mtd');
        rowElement.appendChild(cellElement);

        const itemElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
        cellElement.appendChild(itemElement);
        
        this.renderNode(cell, itemElement);
      });
    });

    if (node.close) {
      const closeElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
      closeElement.textContent = node.close;
      element.appendChild(closeElement);
    }

    return { element };
  }
}

const mathViewer = new MathViewer();