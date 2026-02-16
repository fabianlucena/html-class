import ActDia from '../actdia/actdia.js';
import NodeSelector from './node-selector.js';
import NodeForm from './node-form.js';
import { _, addLocaleUrl, loadLanguage } from '../locale/locale.js';
import { pushNotification, container as notificationContainer } from '../notistack/notistack.js';
import '../drag/drag.js';
import ActDiaTools from './actdia-tools.js';
import { newId } from '../utils/id.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

let container = null,
  actdia = null,
  nodeSelector = null,
  mouseSelectOn,
  actdiaTools = null,
  lastSavedStatus = null,
  history = [];

window.addEventListener('beforeprint', () => notificationContainer.style.display = 'none');
window.addEventListener('afterprint', () => notificationContainer.style.display = '');

window.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();

  container = document.querySelector('#actdia');
  actdia = new ActDia({ container, editable: true });
  await actdia.init();

  nodeSelector = new NodeSelector({ actdia, container });
  nodeSelector.onSelectNode = onSelectNode;
  nodeSelector.onSelectExample = onSelectExample;

  actdia.onPushNotification = pushNotification;

  actdiaTools = new ActDiaTools({ container, actdia });
  actdiaTools.onSave =  () => {
    lastSavedStatus = JSON.stringify(actdia.getData({ noSelectedProperty: true }));
    actdiaTools.setChanged(false);
  };

  actdia.addEventListener('diagramchanged', diagramChanged);
  actdia.addEventListener('dblclick', dblClickHandler);
  actdia.addEventListener('item:dblclick', itemDblClickHandler);
  actdia.addEventListener('keydown', keyDownHandler, true);
  actdia.addEventListener('keyup', keyUpHandler);

  actdia.pushNotification(_('Welcome to ActDia!'), 'info');
  if (window.location.hash && window.location.hash.startsWith('#diagram-')) {
    const data = JSON.parse(decodeURIComponent(window.location.hash.substring(9)));
    await actdia.load(data);
    pushNotification(_('Diagram loaded'), 'success');
  } else if (localStorage.getItem('actdia')) {
    await actdia.load(JSON.parse(localStorage.getItem('actdia')));
    pushNotification(_('Diagram loaded'), 'success');
  }

  lastSavedStatus = JSON.stringify(actdia.getData({ noSelectedProperty: true }));
  pushState();
  actdiaTools.setChanged(false);

  window.addEventListener('hashchange', async () => {
    if (window.location.hash.startsWith('#state-')) {
      const id = window.location.hash.substring(7);
      await loadFromHistory(id);
    }
  });
});

function pushState() {
  const status = JSON.stringify(actdia.getData());
  if (status !== (history.length ? history[history.length - 1].status : null)) {
    let id;
    do {
      id = newId().replaceAll('-', '');
    } while (history.find(h => h.id === id));

    history.push({ id, status });
    window.history.pushState({ id }, '', `#state-${id}`);
  }
}

async function loadFromHistory(id) {
  const entry = history.find(h => h.id === id);
  if (entry) {
    await actdia.load(JSON.parse(entry.status));
    checkForChanges();
  }
}

function dblClickHandler(evt) {
  if (!actdia.editable)
    return;

  mouseSelectOn = actdia.getUntransformedPosition(actdia.mouse);
  nodeSelector.show({ defaultPath: '../../components/actdia-nodes' });
}

function itemDblClickHandler(evt) {
  const { item } = evt.detail;
  if (item) {
    const { mouse } = evt.detail;
    const nodeForm = new NodeForm({ container });
    nodeForm.showForNode(item, { x: mouse.x, y: mouse.y });
    evt.preventDefault();
    evt.stopPropagation();
  }
}

function onSelectNode({ evt, fqcn, }) {
  evt.stopPropagation();
  evt.preventDefault();

  const { x, y } = mouseSelectOn;
  actdia.addItem({
    fqcn,
    x,
    y,
  });

  nodeSelector.close();
}

async function onSelectExample({ evt, url }) {
  evt.stopPropagation();
  evt.preventDefault();

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(_('Can\'t load the file: %s.', url));

    const json = await response.json();
    await this.actdia.load(json, { skipNotification: true });
    pushNotification(_('Diagram loaded from JSON file.'), 'success');
  } catch (err) {
    console.error(err);
    pushNotification(_('Invalid JSON file.'), 'error');
  }
  
  nodeSelector.close();
}

function keyDownHandler(evt) {
  switch (evt.key) {
    case 'Escape': return escapeDefaultHandler(evt);
    case 'Delete': return deleteDefaultHandler(evt);
    case 'Backspace': return backspaceDefaultHandler(evt);
  }
}

function escapeDefaultHandler(evt) {
  actdia.cancelCaptureItem();
  actdia.cancelDrag();
}

function deleteDefaultHandler(evt) {
  actdia.deleteSelected();
}

function backspaceDefaultHandler(evt) {
  actdia.deleteSelected();
}

function keyUpHandler(evt) {
  switch (evt.key) {
    case 'c': if (evt.ctrlKey || evt.metaKey)
      copyJSONToClipboard(evt);
    break;

    case 'v': if (evt.ctrlKey || evt.metaKey)
      pasteJSONFromClipboard();
    break;

    case 'x': if (evt.ctrlKey || evt.metaKey)
      copyJSONToClipboard(evt);
      actdia.deleteSelected();
    break;
  }
}

let incrementalPosition = 0;
async function copyJSONToClipboard(options) {
  incrementalPosition = 1;
  const exportable = actdia.getItems({ onlyExportable: true, selected: true, ...options });
  const jsonText = JSON.stringify(actdia.getData({ items: exportable }), null, 2);
  const json = new ClipboardItem({ 'text/plain': new Blob([jsonText], { type: 'application/json' })});
  await navigator.clipboard.write([json]);
  pushNotification(_('JSON data copied to the clipboard.'), 'success');
}

async function pasteJSONFromClipboard() {
  const clipboardItems = await navigator.clipboard.read();
  for (const clipboardItem of clipboardItems) {
    if (clipboardItem.types.includes('text/plain')) {
      const blob = await clipboardItem.getType('text/plain');
      const text = await blob.text();
      const data = JSON.parse(text);
      await actdia.load(
        data,
        {
          clear: false,
          incrementalPosition,
          clearSelection: incrementalPosition === 1,
          autoselect: true,
        });
      incrementalPosition++;
    }
  }
}

function diagramChanged() {
  pushState();
  checkForChanges();
}

function checkForChanges() {
  const status = JSON.stringify(actdia.getData({ noSelectedProperty: true }));
  actdiaTools.setChanged(status !== lastSavedStatus);
}