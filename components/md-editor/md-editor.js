import { importCss, insertCss } from '../utils/import-css.js';
import MDViewer from '../md-viewer/md-viewer.js';
import { addLocaleUrl, _, onLanguageLoaded } from '../locale/locale.js';
import Menu from '../menu/menu.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

importCss('./md-editor.css', import.meta.url);
const style = insertCss(`.md-editor { --hint-text: "Type \\"/\\" for commands"; } `);

onLanguageLoaded(() => {
  setHint(_('Type "/" for commands'));
  setMenuItems();
});

function setHint(text) {
  style.textContent = `.md-editor { --hint-text: "${text.replace(/"/g, '\\"')}"; } `;
}

function setMenuItems(items) {
  menu.items = [
    {
      label: _('Heading'),
      items: [
        { label: _('Heading 1'), action: () => applyFormat('formatBlock', 'H1') },
        { label: _('Heading 2'), action: () => applyFormat('formatBlock', 'H2') },
        { label: _('Heading 3'), action: () => applyFormat('formatBlock', 'H3') },
        { label: _('Heading 4'), action: () => applyFormat('formatBlock', 'H4') },
        { label: _('Heading 5'), action: () => applyFormat('formatBlock', 'H5') },
        { label: _('Heading 6'), action: () => applyFormat('formatBlock', 'H6') },
      ]
    },
    { label: _('Bold'),              action: () => applyFormat('bold') },
    { label: _('Underline'),         action: () => applyFormat('underline') },
    { label: _('Italic'),            action: () => applyFormat('italic') },
    { label: _('Numbering'),         action: () => applyFormat('insertOrderedList') },
    { label: _('Bullets'),           action: () => applyFormat('insertUnorderedList') },
    { label: _('Interactive list'),  action: () => applyFormat('insertInteractiveList') },
    { label: _('Paragraph'),         action: () => applyFormat('formatBlock', 'P') },
    { label: _('Blockquote'),        action: () => applyFormat('formatBlock', 'BLOCKQUOTE') },
    { label: _('Block'),             action: () => applyFormat('insertBlock') },
  ];
}

document.addEventListener('DOMContentLoaded', async () => {
  init();
});

export default class MDEditor extends MDViewer {
  constructor(options) {
    super(options);
  }

  create(options) {
    super.create(options);

    this.element.classList.add('md-editor');
    this.element.tabIndex = 0;
    this.element.contentEditable = true;
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }
}

var menu,
  activeEditor = null;

function init() {
  setHint(_('Type "/" for commands'));
  document.body.addEventListener('keydown', onKeyDown);
  document.body.addEventListener('keyup', onKeyUp);
  document.body.addEventListener('mouseup', onMouseUp);

  menu = new Menu({
    className: 'floating',
    parentElement: document.body,
    display: false,
  });
  setMenuItems();
}

function updateHint(editor) {
  const sel = window.getSelection();
  const pos = sel.anchorOffset;

  if (pos === 0) {
    editor.classList.add('show-hint');
  } else {
    editor.classList.remove('show-hint');
  }
}

function addCharacter(char) {
  if (activeEditor) {
    activeEditor.textContent += char;
    updateHint(activeEditor);
  }
}

function onKeyUp(event) {
  const editor = event.target;
  if (!editor.classList.contains('md-editor'))
    return;

  updateHint(editor);
}

function onMouseUp(event) {
  const editor = event.target;
  if (!editor.classList.contains('md-editor'))
    return;

  updateHint(editor);
}
  
function onKeyDown(event) {
  const editor = event.target;
  if (!editor.classList.contains('md-editor'))
    return;

  if (menu.showing) {
    event.preventDefault();
    event.stopPropagation();
    menu.handleKeyDown(event);
  }

  if (event.defaultPrevented)
    return;

  switch (event.key) {
    case '/':
      slashDownHandler(event, editor);
      return;

    case 'Tab':
      event.preventDefault();
      if (event.shiftKey)
        document.execCommand('outdent', false);
      else
        document.execCommand('indent', false);
      return;

    case 'Enter':
      const taskInfo = checkInInteractiveList();
      if (taskInfo) {
        event.preventDefault();

        const text = taskInfo.li.textContent.trim();
        if (text === '') {
          exitInteractiveList(taskInfo.li);
          return;
        }

        createNewTaskBelow(taskInfo.li);
      }

      return;
  }
}

function slashDownHandler(event, editor) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
    return;

  activeEditor = editor;
  if (!menu.showing) {
    event.preventDefault();
    event.stopPropagation();

    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);

      const rect = range.getBoundingClientRect();
      menu.setPos(rect.left, rect.top + rect.height);
    }
    
    menu.show();
  } else {
    menu.hide();
  }
}

function applyFormat(format, ...args) {
  menu.hide();

  if (activeEditor) {
    activeEditor.focus();
    if (format === 'insertInteractiveList') {
      toggleTaskItem()
        || createInteractiveList();
    } else if (format === 'insertBlock') {
      createBlock();
    } else {
      document.execCommand(format, false, ...args);
    }
  }
}

function toggleTaskItem() {
  const sel = window.getSelection();
  if (!sel?.rangeCount)
    return false;

  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }

  const li = node.closest('li');
  if (!li)
    return false;

  const existing = li.querySelector('input[type="checkbox"]');

  if (existing) {
    existing.remove();
    return true;
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  li.prepend(checkbox);

  return true;
}

function createInteractiveList() {
  const sel = window.getSelection();
  if (!sel.rangeCount) 
    return;

  const range = sel.getRangeAt(0);;

  let currentBlock = range.startContainer;
  if (currentBlock.nodeType === Node.TEXT_NODE) {
    currentBlock = currentBlock.parentNode;
  }

  const textContent = currentBlock.textContent || '';

  const ul = document.createElement('ul');
  ul.className = 'interactive-list';

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';

  const space = document.createTextNode(' ');
  const textNode = document.createTextNode(textContent);

  li.appendChild(checkbox);
  li.appendChild(space);
  li.appendChild(textNode);
  ul.appendChild(li);

  currentBlock.append(ul);

  const newRange = document.createRange();
  newRange.setStartAfter(textNode);
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);
}

function checkInInteractiveList() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0)
    return;

  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE)
    node = node.parentNode;

  const li = node.closest('li');
  if (!li)
    return;

  const ul = li.closest('ul');
  if (!ul || !ul.classList.contains('interactive-list'))
    return;

  return { li };
}

function exitInteractiveList(li) {
  const p = document.createElement('p');
  p.innerHTML = '<br>';

  li.replaceWith(p);

  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(p, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function createNewTaskBelow(li) {
  const newLi = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  newLi.appendChild(checkbox);
  newLi.appendChild(document.createTextNode(' '));

  li.after(newLi);

  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(newLi, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function createBlock() {
  const sel = window.getSelection();
  if (!sel?.rangeCount)
    return;

  const range = sel.getRangeAt(0);

  const div = document.createElement('div');
  div.className = 'block';
  const p = document.createElement('p');
  p.innerHTML = '<br>';
  div.appendChild(p);

  range.deleteContents();
  range.insertNode(div);

  const newRange = document.createRange();
  newRange.setStart(p, 0);
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);

  document.execCommand('formatBlock', false, 'P');
}
