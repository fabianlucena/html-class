window.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('mouseup', mouseUpHandler, true);
window.addEventListener('mousemove', mouseMoveHandler, true);
window.addEventListener('keydown', keyDownHandler, true);

let draggingElement = null,
  from = { x: 0, y: 0 },
  mouse = { x: 0, y: 0 },
  initial = { x: 0, y: 0 };

function mouseDownHandler(evt) {
  if (evt.button !== 0) {
    return;
  }

  draggingElement = evt.target?.closest('.draggable');
  if (!draggingElement) {
    return;
  }
  
  draggingElement.classList.add('dragging');
  from = { x: evt.clientX, y: evt.clientY };

  const rect = draggingElement.getBoundingClientRect();
  initial = { x: rect.left, y: rect.top };
}

function mouseUpHandler(evt) {
  if (!draggingElement) {
    return;
  }

  evt.stopPropagation();
  evt.preventDefault();
  
  draggingElement.classList.remove('dragging');
  draggingElement = null;
}

function mouseMoveHandler(evt) {
  if (!draggingElement) {
    return;
  }

  evt.stopPropagation();
  evt.preventDefault();

  mouse = { x: evt.clientX, y: evt.clientY };

  let top = Math.min(window.innerHeight - draggingElement.offsetHeight, Math.max(0, initial.y + (mouse.y - from.y)));
  let left = Math.min(window.innerWidth - draggingElement.offsetWidth, Math.max(0, initial.x + (mouse.x - from.x)));
  
  draggingElement.style.left = left + 'px';
  draggingElement.style.top = top + 'px';
}

function keyDownHandler(evt) {
  if (!draggingElement) {
    return;
  }

  evt.stopPropagation();
  evt.preventDefault();

  let top = Math.min(window.innerHeight - draggingElement.offsetHeight, Math.max(0, initial.y));
  let left = Math.min(window.innerWidth - draggingElement.offsetWidth, Math.max(0, initial.x));
  
  draggingElement.style.left = left + 'px';
  draggingElement.style.top = top + 'px';
  
  draggingElement.classList.remove('dragging');
  draggingElement = null;
}