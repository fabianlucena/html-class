import { importCss } from '../utils/import-css.js';
import { escapeHTML } from '../utils/html.js';
import Dialog from '../dialog/dialog.js';
import { _ } from '../locale/locale.js';
import { pushNotification } from '../notistack/notistack.js';
import { getPath } from '../utils/path.js';
import { isConnection, isNode } from '../actdia/type.js';

importCss('./actdia-tools.css', import.meta.url);
const basePath = getPath(import.meta.url);

export default class ActDiaTools {
  menuTool = {
    name: 'menu',
    label: _('Menu'),
    svg: basePath + '/icons/menu.svg',
  };

  toolsCategories = [
    {
      name: 'file',
      label: _('File'),
      title: _('File, export, import, share, and copy operations'),
      tools: [
        {
          name: 'save',
          label: _('Save'),
          description: _('Saves the diagram.'),
          svg: basePath + '/icons/save.svg',
          onClick: () => this.save(),
        },
        {
          name: 'new',
          label: _('New'),
          description: _('Clears the diagram.'),
          svg: basePath + '/icons/new.svg',
          onClick: () => this.clear(),
        },
        {
          name: 'copyJson',
          label: _('Copy JSON to clipboard'),
          description: _('Copies the diagram data to the clipboard in JSON format.'),
          svg: basePath + '/icons/copy-json.svg',
          onClick: () => this.copyJSONToClipboard(),
        },
        {
          name: 'copySvg',
          label: _('Copy SVG to clipboard'),
          description: _('Copies the diagram image to the clipboard in SVG format.'),
          svg: basePath + '/icons/copy-svg.svg',
          onClick: () => this.copySVGToClipboard(),
        },
        {
          name: 'downloadJson',
          label: _('Download JSON'),
          description: _('Download the diagram as a JSON file.'),
          svg: basePath + '/icons/download-json.svg',
          onClick: () => this.downloadJsonHandler(),
        },
        {
          name: 'upload',
          label: _('Upload'),
          description: _('Upload a diagram as a JSON file.'),
          svg: basePath + '/icons/upload.svg',
          onClick: () => this.uploadJson(),
        },
        {
          name: 'share',
          label: _('Share'),
          description: _('Share the diagram as a URL.'),
          svg: basePath + '/icons/share.svg',
          onClick: () => this.share(),
        },
        {
          name: 'downloadSvg',
          label: _('Download SVG'),
          description: _('Download the diagram as a SVG image.'),
          svg: basePath + '/icons/download-svg.svg',
          onClick: () => this.downloadSvgHandler(),
        },
        {
          name: 'view',
          label: _('View'),
          description: _('View the diagram as a JSON data.'),
          svg: basePath + '/icons/view.svg',
          onClick: () => this.view({ selected: true}),
        },
        {
          name: 'viewInConsole',
          label: _('View in console'),
          description: _('View the diagram in the browser\'s console.'),
          svg: basePath + '/icons/view-in-console.svg',
          onClick: () => this.viewInConsole({ selected: true}),
        }
      ],
    },
    {
      name: 'edit',
      label: _('Edit'),
      title: _('Edit operations'),
      tools: [
        {
          name: 'undo',
          label: _('Undo'),
          description: _('Undo the last action.'),
          svg: basePath + '/icons/undo.svg',
          onClick: () => history.back(),
        },
        {
          name: 'redo',
          label: _('Redo'),
          description: _('Redo the last undone action.'),
          svg: basePath + '/icons/redo.svg',
          onClick: () => history.forward(),
        },
        {
          name: 'horizontalFlip',
          label: _('Horizontal flip'),
          description: _('Flips the selected item horizontally.'),
          svg: basePath + '/icons/horizontal-flip.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.horizontalFlip(),
        },
        {
          name: 'verticalFlip',
          label: _('Vertical flip'),
          description: _('Flips the selected item vertically.'),
          svg: basePath + '/icons/vertical-flip.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.verticalFlip(),
        },
        {
          name: 'bringToFront',
          label: _('Bring to front'),
          description: _('Brings the selected item to the front of the diagram.'),
          svg: basePath + '/icons/bring-to-front.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.bringToFront(),
        },
        {
          name: 'bringForward',
          label: _('Bring forward'),
          description: _('Brings the selected item one level forward in the diagram.'),
          svg: basePath + '/icons/bring-forward.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.bringForward(),
        },
        {
          name: 'sendBackward',
          label: _('Send backward'),
          description: _('Sends the selected item one level back in the diagram.'),
          svg: basePath + '/icons/send-backward.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.sendBackward(),
        },
        {
          name: 'sendToBack',
          label: _('Send to back'),
          description: _('Sends the selected item to the back of the diagram.'),
          svg: basePath + '/icons/send-to-back.svg',
          update: this.enableForAnySelectedNode,
          onClick: () => this.sendToBack(),
        },
        {
          name: 'rotateCW',
          label: _('Rotate clockwise'),
          description: _('Rotates the selected item 90 degrees clockwise.'),
          svg: basePath + '/icons/rotate-cw.svg',
          update: ({tool, anySelectedNode}) => {
            tool.disabled = !anySelectedNode || !tool.canRotate;
            tool.element.classList.toggle('disabled', !anySelectedNode);
          },
          onClick: () => this.rotateCW(),
        },
        {
          name: 'rotateCCW',
          label: _('Rotate counterclockwise'),
          description: _('Rotates the selected item 90 degrees counterclockwise.'),
          svg: basePath + '/icons/rotate-ccw.svg',
          update: ({tool, anySelectedNode}) => {
            tool.disabled = !anySelectedNode || !tool.canRotate;
            tool.element.classList.toggle('disabled', !anySelectedNode);
          },
          onClick: () => this.rotateCCW(),
        },
        {
          name: 'x',
          label: 'X',
          description: _('X coord of the item.'),
          type: 'number',
          min: 0,
          update: ({tool, selectedNode}) => {
            if (selectedNode) {
              tool.input.disabled = false;
              tool.input.value = selectedNode.x;
            } else {
              tool.input.disabled = true;
              tool.input.value = '';
            }
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getNodes({ onlySelected: true });
            nodes.forEach(node => {
              node.x = value;
              node.updateTransform();
            });
          },
        },
        {
          name: 'y',
          label: 'Y',
          description: _('Y coord of the item.'),
          type: 'number',
          min: 0,
          update: ({tool, selectedNode}) => {
            if (selectedNode) {
              tool.input.disabled = false;
              tool.input.value = selectedNode.y;
            } else {
              tool.input.disabled = true;
              tool.input.value = '';
            }
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getNodes({ onlySelected: true });
            nodes.forEach(node => {
              node.y = value;
              node.updateTransform();
            });
          },
        },
        {
          name: 'width',
          label: _('Width'),
          description: _('Width of the item.'),
          type: 'number',
          min: 0,
          update: ({tool, selectedNode}) => {
            if (selectedNode) {
              tool.input.disabled = !(tool.canChangeSize || tool.canChangeWidth);
              tool.input.value = selectedNode.width;
            } else {
              tool.input.disabled = true;
              tool.input.value = '';
            }
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getNodes({ onlySelected: true });
            nodes.forEach(node => {
              node.width = value;
              node.updateTransform();
            });
          },
        },
        {
          name: 'height',
          label: _('Height'),
          description: _('Height of the item.'),
          type: 'number',
          min: 0,
          update: ({tool, selectedNode}) => {
            if (selectedNode) {
              tool.input.disabled = !(tool.canChangeSize || tool.canChangeHeight);
              tool.input.value = selectedNode.height;
            } else {
              tool.input.disabled = true;
              tool.input.value = '';
            }
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getNodes({ onlySelected: true });
            nodes.forEach(node => {
              node.height = value;
              node.updateTransform();
            });
          },
        },
      ],
    },
  ];

  toolOptions = { sx: 18, sy: 18 };
  onSave = null;

  constructor({ container, actdia }) {
    this.container = container;
    this.actdia = actdia;
    this.create();
  }

  create() {
    this.container ??= document.body;
    this.element ??= document.querySelector('#actdia-tools');
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.id = 'actdia-tools';
      this.container.insertBefore(this.element, this.container.firstChild);
    }

    this.element.classList.add('actdia-tools');

    this.prepareTool(this.menuTool);
    this.container.insertBefore(this.menuTool.element, this.container.firstChild);

    this.toolsContainerElement = document.createElement('div');
    this.toolsContainerElement.classList.add('actdia-tools-tools-container');
    this.element.appendChild(this.toolsContainerElement);

    this.toolsElement = document.createElement('div');
    this.toolsElement.classList.add('actdia-tools-category-tools-container');
    this.toolsContainerElement.appendChild(this.toolsElement);

    this.dynamicToolsElement = document.createElement('div');
    this.dynamicToolsElement.classList.add('actdia-tools-dynamic-tools-container');
    this.toolsContainerElement.appendChild(this.dynamicToolsElement);

    this.labelsElement = document.createElement('div');
    this.labelsElement.classList.add('actdia-tools-category-labels');
    this.element.appendChild(this.labelsElement);

    this.menuTool.element.addEventListener('click', () => this.element.classList.toggle('hidden'));

    this.toolsCategories.forEach(category => {
      const labelElement = document.createElement('div');
      category.labelElement = labelElement;
      labelElement.classList.add('actdia-tools-category-label');
      this.labelsElement.appendChild(labelElement);

      const toolsElement = document.createElement('div');
      category.toolsElement = toolsElement;
      toolsElement.classList.add('actdia-tools-category-tools');
      this.toolsElement.appendChild(toolsElement);

      labelElement.dataset.name = category.name;
      labelElement.innerHTML = category.label;
      labelElement.title = category.title;

      category.tools.forEach(tool => {
        this.prepareTool(tool);
        if (tool.element) {
          toolsElement.appendChild(tool.element);
        }
      });
    });

    this.element.addEventListener('click', evt => this.clickHandler(evt));

    this.updateToolsCategories();
    this.selectCategory('edit');
  }

  update() {
    const selectedItems = this.actdia.getItems({ onlySelected: true });
    const selectedNodes = selectedItems.filter(item => isNode(item));
    const selectedConnections = selectedItems.filter(item => isConnection(item));
    const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
    const selectedConnection = selectedConnections.length === 1 ? selectedConnections[0] : null;
    const data = {
      selectedItems,
      selectedItemsCount: selectedItems.length,
      selectedNode,
      selectedNodes,
      selectedNodesCount: selectedNodes.length,
      anySelectedNode: selectedNodes.length > 0,
      selectedConnection: selectedConnection,
      selectedConnections,
      selectedConnectionsCount: selectedConnections.length,
      anySelectedConnection: selectedConnections.length > 0,
    };

    this.toolsCategories.forEach(category => {
      category.tools.forEach(tool => tool.update?.({tool, ...data}));
    });

    if (this.selectedNode !== selectedNodes[0]) {
      this.selectedNode = null;
      this.dynamicToolsElement.innerHTML = '';

      if (selectedNode) {
        this.selectedNode = selectedNode;
        const node = this.selectedNode;
        const fields = node.fields?.filter(f => f.isTool);
        fields?.forEach(field => {
          const tool = {...field};
          tool.update = ({tool}) => {
            tool.input.value = node[field.name];
          };
          tool.onChange = evt => {
            const value = field.type === 'number' ? parseFloat(evt.target.value) : evt.target.value;
            node[field.name] = value;
          }
          tool.label ??= _(tool._label);
          this.prepareTool(tool);
          this.dynamicToolsElement.appendChild(tool.element);
          tool.input.value = node[field.name];
        });
      }
    }
  }

  updateToolsCategories() {
    let selected = this.toolsCategories.find(c => c.selected)
      || this.toolsCategories[0];

    this.toolsCategories.forEach(category => {
      const isSelected = category === selected;
      category.selected = isSelected;
      if (isSelected) {
        category.toolsElement.classList.remove('hidden');
        category.labelElement.classList.add('selected');
      } else {
        category.toolsElement.classList.add('hidden');
        category.labelElement.classList.remove('selected');
      }
    });
  }

  getSelectedToolCategory() {
    return this.toolsCategories.find(c => c.selected) || this.toolsCategories[0];
  }

  getToolByName(name) {
    const category = this.getSelectedToolCategory();
    const tool = category.tools.find(t => t.name === name);
    if (tool?.name === name) {
      return tool;
    }

    for (const category of this.toolsCategories) {
      const tool = category.tools.find(t => t.name === name);
      if (tool?.name === name) {
        return tool;
      }
    }
  }

  prepareTool(tool) {
    if (!tool.element) {
      const element = document.createElement('div');
      tool.element = element;
      element.classList.add('actdia-tool');

      if (tool.svg) {
        element.classList.add('actdia-tool-button');
        fetch(tool.svg)
          .then(response => response.text())
          .then(svgText => element.insertAdjacentHTML('afterbegin', svgText))
          .catch(err => console.error('Error loading SVG for tool', tool, err));
      }

      if (tool.type === 'number') {
        element.classList.add('actdia-tool-input');
        tool.labelElement = document.createElement('span');
        tool.labelElement.textContent = tool.label;
        element.appendChild(tool.labelElement);

        tool.input = document.createElement('input');
        const input = tool.input;
        input.classList.add('actdia-tool-input');
        input.type = 'number';
        input.min = tool.min ?? 0;
        input.max = tool.max ?? '';
        input.step = tool.step ?? '';
        input.value = tool.value ?? '';
        input.addEventListener('change', evt => tool.onChange?.(evt));
        element.appendChild(input);
      }
    }

    if (tool.element) {
      const element = tool.element;
      if (tool.id) {
        element.id = escapeHTML(tool.id);
        element.dataset.id = escapeHTML(tool.id);
      }

      if (tool.name)
        element.dataset.name = escapeHTML(tool.name);

      let title = tool.label ?? tool.name;
      if (title && tool.description) {
        title += ':\n' + tool.description;
      }

      element.title = title;
    }
  }

  clickHandler(evt) {
    const name = evt.target?.closest('.actdia-tool-button')?.dataset?.name;
    if (name) {
      const tool = this.getToolByName(name);
      if (tool) {
        if (tool.disabled)
          return;

        const onClick = tool?.onClick;
        if (onClick) {
          onClick();
          return;
        }
      }
    }
    
    const category = evt.target?.closest('.actdia-tools-category-label')?.dataset?.name;
    if (category) {
      this.selectCategory(category);
      return;
    }
  }

  selectCategory(name) {
    const select = this.toolsCategories.find(c => c.name === name);
    this.toolsCategories.forEach(c => c.selected = c === select);
    this.updateToolsCategories();
  }

  setChanged(changed) {
    this.menuTool.element.classList.toggle('changed', !!changed);
    if (changed) {
      this.menuTool.element.title = _('Menu') + ':\n' + _('Diagram modified (unsaved changes).');
    } else {
      this.menuTool.element.title = _('Menu');
    }
  }

  getExportableItems(options) {
    return this.actdia.getItems({ onlyExportable: true, selected: true, ...options });
  }

  getData(options) {
    return this.actdia.getData(options);
  }

  save() {
    const data = this.getData();
    localStorage.setItem('actdia', JSON.stringify(data));
    pushNotification(_('Diagram saved.'), 'success');
    this.onSave?.();
  }

  clear() {
    if (this.actdia.modified === false) {
      this.forceClear();
      return;
    }
    
    new Dialog({
      container: this.container,
      header: _('Confirm clear'),
      content: _('Do you want to clear all items of the diagram?'),
      onYes: evt => this.forceClear(),
      noButton: true,
      cancelButton: true,
    });
  }

  forceClear() {
    this.actdia.clear();
    pushNotification(_('Diagram cleared.'), 'success');
  }

  async copyJSONToClipboard(options) {
    const exportable = this.getExportableItems(options);
    const jsonText = JSON.stringify(this.getData({ items: exportable }), null, 2);
    const json = new ClipboardItem({ 'text/plain': new Blob([jsonText], { type: 'application/json' })});
    await navigator.clipboard.write([json]);
    pushNotification(_('JSON data copied to the clipboard.'), 'success');
  }

  async copySVGToClipboard(options) {
    const exportable = this.getExportableItems(options);
    const svgText = await this.actdia.getSVG(exportable);
    const svg = new ClipboardItem({ 'text/plain': new Blob([svgText], { type: 'image/svg+xml' })});
    await navigator.clipboard.write([svg]);
    pushNotification(_('SVG image copied to the clipboard.'), 'success');
  }

  downloadJsonHandler() {
    if (!this.getExportableItems({ onlySelected: true }).length) {
      this.downloadJson({ selected: false});
      return;
    }

    const dialog  = new Dialog({
      container: this.container,
      header: _('Export dialog'),
      content: `<p>${_('Do you want to export the entire diagram or only the selected items?')}</p>
        <button id="export-all" class="button">${_('Export all')}</button>
        <button id="export-selected" class="button">${_('Export selected')}</button>`,

      onClick: evt => {
        if (evt.target.closest('#export-all')) {
          this.downloadJson({ selected: false});
          dialog.close();
        } else if (evt.target.closest('#export-selected')) {
          this.downloadJson({ selected: true});
          dialog.close();
        }
      }
    });
  }

  downloadJson(options) {
    const exportable = this.getExportableItems(options);
    const jsonText = JSON.stringify(this.getData({ items: exportable }), null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actdia.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  uploadJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file)
        return;

      const reader = new FileReader();
      reader.onload = async evt => {
        try {
          const json = JSON.parse(evt.target.result);
          await this.actdia.load(json, { skipNotification: true });
          pushNotification(_('Diagram loaded from JSON file.'), 'success');
        } catch (err) {
          console.error(err);
          pushNotification(_('Invalid JSON file.'), 'error');
        }
      };
      reader.readAsText(file);
    });

    input.click();
  }

  share(options) {
    const exportable = this.getExportableItems(options);
    const data = this.getData({ items: exportable });
    const url = new URL(window.location.href);
    url.hash = '#diagram-' + encodeURIComponent(JSON.stringify(data));
    navigator.clipboard.writeText(url.toString())
      .then(() => pushNotification(_('URL copied to clipboard.'), 'success'))
      .catch(err => pushNotification(_('Error to copy: %s', err), 'error'));
  }

  downloadSvgHandler(options) {
    if (!this.getExportableItems({ onlySelected: true }).length) {
      this.downloadSvg({ selected: false});
      return;
    }

    const dialog  = new Dialog({
      container: this.container,
      header: _('Export dialog'),
      content: `<p>${_('Do you want to export the entire diagram or only the selected items?')}</p>
        <button id="export-all" class="button">${_('Export all')}</button>
        <button id="export-selected" class="button">${_('Export selected')}</button>`,

      onClick: evt => {
        if (evt.target.closest('#export-all')) {
          this.downloadSvg({ selected: false});
          dialog.close();
        } else if (evt.target.closest('#export-selected')) {
          this.downloadSvg({ selected: true});
          dialog.close();
        }
      }
    });
  }
  
  async downloadSvg(options) {
    const exportable = this.getExportableItems(options);
    const svgText = await this.actdia.getSVG(exportable);
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actdia.svg';
    a.click();
  }

  viewInConsole(options) {
    const exportable = this.getExportableItems(options);
    const data = this.getData({ items: exportable });
    console.log(data);
  }

  view(options) {
    const exportable = this.getExportableItems(options);
    const data = this.getData({ items: exportable });
    new Dialog({
      container: this.container,
      content: '<pre>' + JSON.stringify(data, '', 2) + '</pre>',
      header: _('JSON data'),
    });
  }

  bringToFront(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    this.actdia.bringToFront(...items);
  }

  bringForward(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    this.actdia.bringForward(...items);
  }

  sendBackward(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    this.actdia.sendBackward(...items);
  }

  sendToBack(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    this.actdia.sendToBack(...items);
  }

  enableForAnySelectedNode({tool, anySelectedNode}) {
    tool.disabled = !anySelectedNode;
    tool.element.classList.toggle('disabled', !anySelectedNode);
  }

  horizontalFlip(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    items.forEach(item => item.reflection = {x: (item.sx ?? 1) * -1});
  }

  verticalFlip(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    items.forEach(item => item.reflection = {y: (item.sy ?? 1) * -1});

  }

  rotateCW(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    items.forEach(item => item.rotate += 90);
  }

  rotateCCW(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    items.forEach(item => item.rotate -= 90);
  }
}