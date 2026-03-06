import { importCss } from '../utils/import-css.js';

importCss('./text_editor.css', import.meta.url);

document.addEventListener('DOMContentLoaded', init);

const
  highlightColor = '#4060FF',
  highlightBias = 0;
let
  svg,
  svgText,
  singleLine,
  numerical,
  textarea,
  defs,
  caret,
  highlightBox,
  selectionBox,
  value,
  selStart,
  selEnd,
  selDir,
  caretPos,
  isPreservingWhitespace = false,
  lineHeight,
  x;
function init() {
  textarea = document.createElement('textarea');
  textarea.style.position = 'absolute';
  textarea.style.left = '35em';
  textarea.style.top = '2em';
  textarea.style.opacity = 0;
  textarea.style.zIndex = -1;
  document.body.appendChild(textarea);

  caret = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  caret.classList.add('text-caret');
  caret.setAttribute('d', 'M 0 0 L 0 1');

  highlightBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  highlightBox.style.filter = 'url(#shadow)';
  highlightBox.setAttribute('fill', 'none');
  highlightBox.setAttribute('stroke', highlightColor);

  selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  selectionBox.classList.add('text-selection');

  defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow
        dx="0" dy="0"
        stdDeviation=".15" 
        flood-color="${highlightColor}" 
        flood-opacity="1" 
        filterUnits="userSpaceOnUse"
      />
    </filter>`;

  textarea.addEventListener('input', syncFromTextarea);
  textarea.addEventListener('keydown', keydownHandler);
  textarea.addEventListener('keyup', syncFromTextarea);
  textarea.addEventListener('select', syncFromTextarea);
  textarea.addEventListener('compositionend', syncFromTextarea);
  textarea.addEventListener('blur', endEditing);

  document.body.addEventListener('click', clickHandler);
}

function clickHandler(evt) {
  let target = evt.target;
  if (target.tagName === 'tspan') {
    target = target.parentElement;
  }

  if (target.tagName === 'text' && target.getAttribute('editable')) {
    beginEditing(target);
  }
}

function getEffectiveFill(el) {
  const cs = getComputedStyle(el);
  if (cs.fill === 'none' || cs.fill === 'transparent') {
    return getEffectiveFill(el.parentNode);
  }

  return cs.fill;
}

function beginEditing(textElement) {
  svgText = textElement;
  singleLine = svgText.getAttribute('single-line') !== null;
  numerical = svgText.getAttribute('numerical') !== null;
  svg = svgText.closest('svg');

  svg.insertBefore(defs, svg.firstChild);
  svgText.parentNode.insertBefore(highlightBox, svgText);
  svgText.parentNode.insertBefore(selectionBox, svgText);
  svgText.parentNode.appendChild(caret);

  highlightBox.setAttribute('fill', getEffectiveFill(svgText.parentNode));

  let currentText = '';
  lineHeight = 0;
  if (svgText.children.length) {
    let dy = 0;
    let xl = [];
    let linesHeights = []
    for (const child of svgText.children) {
      currentText += child.textContent.trim() + '\n';
      
      let newX = child.getAttribute('x');
      if (newX !== null) {
        xl.push(parseFloat(newX));
        let newDy = parseFloat(child.getAttribute('dy') || 0);
        if (newDy > dy) {
          linesHeights.push(newDy - dy);
          dy = newDy;
        }
      }
    }

    if (linesHeights.length) {
      lineHeight = linesHeights.reduce((a, b) => a + b, 0) / linesHeights.length;
    }

    if (xl.length) {
      x = xl.reduce((a, b) => a + b, 0) / xl.length;
    }
  } else {
    currentText = svgText.textContent;
  }

  if (currentText.endsWith('\n')) {
    currentText = currentText.substring(0, currentText.length - 1);
  }
  
  textarea.value = currentText;
  textarea.focus();

  isPreservingWhitespace = getIsPreservingWhitespaceForElement(svgText);

  syncFromTextarea();
}

function endEditing() {
  svgText = null;
  caret.remove();
  selectionBox.remove();
  highlightBox.remove();
  defs.remove();
}

function getIsPreservingWhitespaceForElement(el) {
  while (el && el.nodeType === 1) {
    const val =
      el.getAttribute('xml:space') ??
      el.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'space');

    if (val === 'preserve') return true;
    if (val === 'default') return false;

    el = el.parentNode;
  }
  return false;
}

function syncToTextarea() {
  let currentText = '';
  if (svgText.children.length) {
    for (const child of svgText.children) {
      currentText += child.textContent.trim() + '\n';
    }
  } else {
    currentText = svgText.textContent;
  }
  
  textarea.value = currentText;
}

function keydownHandler(evt) {
  if (evt.key === 'Enter') {
    if (singleLine) {
      evt.preventDefault();
      return;
    }

    if (evt.shiftKey) {
      evt.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '\n' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      syncFromTextarea();
    }

    return;
  }
  
  if (evt.key === 'Tab') {
    evt.preventDefault();
    const currentSvgElement = svgText;
    endEditing();
    if (currentSvgElement) {
      let nextElement = currentSvgElement.nextElementSibling
        || currentSvgElement.parentNode.firstElementChild;
      while (nextElement && nextElement !== currentSvgElement && !(nextElement.tagName === 'text' && nextElement.getAttribute('editable'))) {
        nextElement = nextElement.nextElementSibling
          || currentSvgElement.parentNode.firstElementChild;
      }

      if (nextElement) {
        beginEditing(nextElement);
      }
    }

    return;
  }

  if (numerical) {
    if (evt.key.length === 1 && !/[0-9.\-+eE]/.test(evt.key)) {
      evt.preventDefault();
      return;
    }
    
    if (evt.key === '-' || evt.key === '+') {
      if (textarea.selectionStart !== 0 && textarea.value[textarea.selectionStart - 1] !== 'e' && textarea.value[textarea.selectionStart - 1] !== 'E') {
        evt.preventDefault();
        return;
      }
    }

    if (evt.key === '.' && textarea.value.includes('.')) {
      evt.preventDefault();
      return;
    }

    if (evt.key.toLowerCase() === 'e') {
      if (textarea.value.toLowerCase().includes('e')) {
        evt.preventDefault();
        return;
      }

      if (textarea.selectionStart === 0) {
        evt.preventDefault();
        return;
      }
    }
  }
}

function syncFromTextarea() {
  if (!svgText)
    return;

  if (value !== textarea.value) {
    value = textarea.value;
    emitInput();
  }

  selStart = textarea.selectionStart ?? value.length;
  selEnd = textarea.selectionEnd ?? value.length;
  selDir = textarea.selectionDirection ?? 'none';
  if (selDir === 'backward') {
    caretPos = selStart;
  } else {
    caretPos = selEnd;
  }

  renderSVG();
}

function renderSVG() {
  const lines = value.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let tspan = svgText.children[i];
    if (!tspan) {
      tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', x || 0);
      tspan.setAttribute('dy', i === 0 ? 0 : (lineHeight || svgText.style.lineSpacing || svgText.style.fontSize || 1.2));
      svgText.appendChild(tspan);
    }
    tspan.textContent = lines[i];
  }

  let box = JSON.parse(svgText.getAttribute('box') ?? '') || svgText.getBBox();
  highlightBox.setAttribute('transform', `translate(${box.x - highlightBias}, ${box.y - highlightBias})`);
  highlightBox.setAttribute('width', box.width + highlightBias * 2);
  highlightBox.setAttribute('height', box.height + highlightBias * 2);

  if (selStart !== selEnd) {
    const startPos = getPosCoordinates(selStart);
    const endPos = getPosCoordinates(selEnd);

    if (startPos.tspan === endPos.tspan) {
      selectionBox.innerHTML = `<rect x="${startPos.x}" y="${startPos.y}" width="${endPos.x - startPos.x || 1}" height="${startPos.tspan.getBBox().height}"></rect>`;
    } else {
      const rects = [];
      let currentTspan = startPos.tspan;
      let currentBBox = currentTspan.getBBox();
      let minX = currentBBox.x;
      currentBBox = {
        x: startPos.x,
        y: currentBBox.y,
        width: currentBBox.width - startPos.x,
        height: currentBBox.height,
      };
      do {
        let nextTspan = currentTspan.nextElementSibling;
        let nextBBox = nextTspan.getBBox();
        let height = nextBBox.y - currentBBox.y;
         
        rects.push(`<rect x="${currentBBox.x}" y="${currentBBox.y}" width="${(currentBBox.width > 0 ? currentBBox.width : 1) || 1}" height="${height}"></rect>`);
        currentTspan = nextTspan;
        currentBBox = nextBBox;
        if (currentBBox.x < minX) {
          minX = currentBBox.x;
        }
      } while (currentTspan && currentTspan !== endPos.tspan);

      currentBBox = {
        x: currentBBox.x,
        y: currentBBox.y,
        width: endPos.x - currentBBox.x,
        height: currentBBox.height,
      };
      rects.push(`<rect x="${currentBBox.x}" y="${currentBBox.y}" width="${currentBBox.width || 1}" height="${currentBBox.height}"></rect>`);

      selectionBox.innerHTML = rects.join('');
    }
  } else if (selectionBox.children.length) {
    selectionBox.innerHTML = '';
  }

  const pos = getPosCoordinates(caretPos);
  caret.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
  caret.setAttribute('d', `M 0 0 L 0 ${pos.tspan.getBBox().height}`);
}

function getPosCoordinates(pos) {
  const textToPos = value.substring(0, pos);
  const linesToPos = textToPos.split('\n');
  const posLine = linesToPos.length - 1;
  let tspan = svgText.children[posLine];
  let lastLineRendered = linesToPos[linesToPos.length - 1];
  if (!isPreservingWhitespace)
    lastLineRendered = lastLineRendered.replace(/\s+/g, ' ');
  let posCol = lastLineRendered.length;
  const max = tspan.getNumberOfChars();
  if (posCol >= max)
    posCol = max;

  let coords;

  if (posCol) {
    if (posCol === max) {
      const bbox = tspan.getBBox();
      coords = { x: bbox.x + bbox.width, y: bbox.y };
    } else {
      const svgPos = tspan.getStartPositionOfChar(posCol);
      coords = { x: svgPos.x, y: svgPos.y };
    }
  } else {
    if (tspan.textContent.length) {
      const bbox = tspan.getBBox();
      coords = { x: bbox.x, y: bbox.y };
    } else {
      while (!tspan.textContent.length && tspan.previousElementSibling) {
        tspan = tspan.previousElementSibling;
      }
      if (tspan.textContent.length) {
        const bbox = tspan.getBBox();
        coords = { x, y: bbox.y + bbox.height };
      }
    }
  }
  return { ...coords, tspan };
}

const activeProperties = {};
Object.defineProperty(activeProperties, 'value', {
  get() { return value || ''; },
  set(v) {
    value = v;
    syncToTextarea();
    renderSVG();
  }
});

function emitInput() {
  const event = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    data: activeProperties.value,
    inputType: 'insertText',
  });

  svgText?.dispatchEvent(event);
}
