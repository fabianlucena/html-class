import { importCss, insertCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import { addLocaleUrl, _, onLanguageLoaded } from '../locale/locale.js';
import Menu from '../menu/menu.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

importCss('./class-editor.css', import.meta.url);
const style = insertCss(`.class-editor { --hint-text: "Type \\"/\\" for commands"; } `);

onLanguageLoaded(() => {
  setHint(_('Type "/" for commands'));
  setMenuItems();
});

function setHint(text) {
  style.textContent = `.class-editor { --hint-text: "${text.replace(/"/g, '\\"')}"; } `;
}

function setMenuItems(items) {
  menu.items = [
    {
      label: _('Heading'),
      items: [
        { label: _('Heading 1'), action: () => applyFormat('formatBlock', false, 'h1') },
        { label: _('Heading 2'), action: () => applyFormat('formatBlock', false, 'h2') },
        { label: _('Heading 3'), action: () => applyFormat('formatBlock', false, 'h3') },
        { label: _('Heading 4'), action: () => applyFormat('formatBlock', false, 'h4') },
        { label: _('Heading 5'), action: () => applyFormat('formatBlock', false, 'h5') },
        { label: _('Heading 6'), action: () => applyFormat('formatBlock', false, 'h6') },
      ]
    },
    { label: _('Bold'),      action: () => applyFormat('bold') },
    { label: _('Italic'),    action: () => applyFormat('italic') },
  ];
}

document.addEventListener('DOMContentLoaded', async () => {
  init();
});

export default class ClassEditor extends Base {
  constructor(options) {
    super();
    this.create(options);
  }

  create(options) {
    super.create(options);
    if (!this.parent)
      this.parent = document.body;

    if (!this.element) {
      this.element = document.createElement('div');
      this.parent.appendChild(this.element);
    }

    this.element.classList.add('class-editor');
    this.element.tabIndex = 0;
    this.element.contentEditable = true;
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }
}

var menu,
  inEditorMenu = null;

function init() {
  setHint(_('Type "/" for commands'));
  document.body.addEventListener('keydown', onKeyDown);
  document.body.addEventListener('keyup', onKeyUp);
  document.body.addEventListener('mouseup', onMouseUp);

  menu = new Menu({
    className: 'floating',
    parent: document.body,
    // display: false,
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
  if (inEditorMenu) {
    inEditorMenu.textContent += char;
    updateHint(inEditorMenu);
  }
}

function onKeyUp(event) {
  const editor = event.target;
  if (!editor.classList.contains('class-editor'))
    return;

  updateHint(editor);
}

function onMouseUp(event) {
  const editor = event.target;
  if (!editor.classList.contains('class-editor'))
    return;

  updateHint(editor);
}
  
function onKeyDown(event) {
  const editor = event.target;
  if (!editor.classList.contains('class-editor'))
    return;

  switch (event.key) {
    case '/':
      slashDownHandler(event, editor);
      return;
    
    case 'Escape':
      if (menu.showing) {
        menu.hide();
        event.preventDefault();
        event.stopPropagation();
      }
  }
}

function slashDownHandler(event, editor) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
    return;

  inEditorMenu = editor;
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
  if (inEditorMenu) {
    inEditorMenu.focus();
    console.log('Applying format:', format, args);
    document.execCommand(format, false, ...args);
  }
  
  menu.hide();
}