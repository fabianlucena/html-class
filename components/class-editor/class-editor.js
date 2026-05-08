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
        { label: _('Heading 1'), action: () => applyFormat('formatBlock', false, 'H1') },
        { label: _('Heading 2'), action: () => applyFormat('formatBlock', false, 'H2') },
        { label: _('Heading 3'), action: () => applyFormat('formatBlock', false, 'H3') },
        { label: _('Heading 4'), action: () => applyFormat('formatBlock', false, 'H4') },
        { label: _('Heading 5'), action: () => applyFormat('formatBlock', false, 'H5') },
        { label: _('Heading 6'), action: () => applyFormat('formatBlock', false, 'H6') },
      ]
    },
    { label: _('Bold'),       action: () => applyFormat('bold') },
    { label: _('Underline'),  action: () => applyFormat('underline') },
    { label: _('Italic'),     action: () => applyFormat('italic') },
    { label: _('Numbering'),  action: () => applyFormat('insertOrderedList') },
    { label: _('Bullets'),    action: () => applyFormat('insertUnorderedList') },
    { label: _('Task list'),  action: () => applyFormat('insertTaskList') },
    { label: _('Paragraph'),  action: () => applyFormat('formatBlock', false, 'P') },
    { label: _('Blockquote'), action: () => applyFormat('formatBlock', false, 'BLOCKQUOTE') },
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

  if (menu.showing) {
    event.preventDefault();
    event.stopPropagation();
    menu.handleKeyDown(event);
  }

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
    document.execCommand(...arguments);
  }
  
  menu.hide();
}