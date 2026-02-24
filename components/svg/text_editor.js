import { importCss } from '../utils/import-css.js';

importCss('./text_editor.css', import.meta.url);

document.addEventListener('DOMContentLoaded', init);

let svgText,
  textarea,
  caret,
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
  textarea.style.left = '350px';
  textarea.style.top = '1px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  caret = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  caret.classList.add('text-caret');
  caret.setAttribute('d', 'M 0 0 L 0 1');

  selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  selectionBox.classList.add('text-selection');

  textarea.addEventListener('input', syncFromTextarea);
  textarea.addEventListener('keyup', syncFromTextarea);
  textarea.addEventListener('mouseup', syncFromTextarea);
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

function beginEditing(textElement) {
  svgText = textElement;
  svgText.parentNode.appendChild(caret);
  svgText.parentNode.insertBefore(selectionBox, svgText);
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
  
  textarea.value = currentText;
  textarea.focus();

  isPreservingWhitespace = getIsPreservingWhitespaceForElement(svgText);

  syncFromTextarea();
}

function endEditing() {
  svgText = null;
  caret.remove();
  selectionBox.remove();
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

function syncFromTextarea() {
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

  svgText.dispatchEvent(event);
}
