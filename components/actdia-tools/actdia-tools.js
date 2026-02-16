import { importCss } from '../utils/import-css.js';
import Item from '../actdia/item.js';
import { escapeHTML } from '../utils/html.js';
import Dialog from '../dialog/dialog.js';
import { _ } from '../locale/locale.js';
import { pushNotification } from '../notistack/notistack.js';

importCss('./actdia-tools.css', import.meta.url);

export default class ActDiaTools {
  tools = [
    new Item({
      type: 'tool',
      name: 'menu',
      label: _('Menu'),
      position: 'fixed',
      classList: ['full-filled'],
      shape: {
        shapes: [
          {
            shape: 'rect',
            y: .2,
            width: 1,
            height: .18,
            rx: .1,
            ry: .1,
            stroke: false,
          },
          {
            shape: 'rect',
            y: .5,
            width: 1,
            height: .18,
            rx: .1,
            ry: .1,
            stroke: false,
          },
          {
            shape: 'rect',
            y: .8,
            width: 1,
            height: .18,
            rx: .1,
            ry: .1,
            stroke: false,
          },
          {
            name: 'changed',
            shape: 'path',
            rotation: [ 10, .5, .5 ],
            sx: .66,
            sy: .66,
            x: .66,
            className: 'bright',
            visible: false,
            d: `
              M 0.50,0.00
              L 0.5765,0.3152
              L 0.8536,0.1464
              L 0.6848,0.4235
              L 1.00,0.50
              L 0.6848,0.5765
              L 0.8536,0.8536
              L 0.5765,0.6848
              L 0.50,1.00
              L 0.4235,0.6848
              L 0.1464,0.8536
              L 0.3152,0.5765
              L 0.00,0.50
              L 0.3152,0.4235
              L 0.1464,0.1464
              L 0.4235,0.3152
              Z`,    
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      hideable: false,
      onClick: () => {
        this.tools
          .filter(i => i.type === 'tool' && i.hideable !== false)
          .forEach(i => i.visible = !i.visible);
      },
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'sendToBack',
      label: _('Send to back'),
      description: _('Sends the selected item to the back of the diagram.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: `
              M 0.05 0.10 H 0.72
              M 0.05 0.36 H 0.72
              M 0.05 0.63 H 0.72
              M 0.05 0.90 H 0.95
              Z`,
            strokeWidth: .1,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.sendToBack(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'save',
      label: _('Save'),
      description: _('Saves the diagram.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: `
              M0 0 H1 V1 H0 Z
              M0.15 0 V0.35 H0.85 V0
              M0.3 0 V0.2 H0.7 V0
              M0.15 0.6 H0.85 V1 H0.15 Z`,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.save(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'new',
      label: _('New'),
      description: _('Clears the diagram.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'rect',
            x: 0.1,
            y: 0.3,
            width: 0.8,
            height: 0.7,
          },
          {
            shape: 'path',
            x: 1,
            sx: .5,
            sy: .5,
            className: 'bright',
            d: `M 0.5 0
              L 0.612256 0.345492
              L 0.975528 0.345492
              L 0.681636 0.559016
              L 0.793893 0.904508
              L 0.5 0.690983
              L 0.206107 0.904508
              L 0.318364 0.559016
              L 0.024472 0.345492
              L 0.387744 0.345492
              Z`,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.clear(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'copy_json',
      label: _('Copy JSON to clipboard'),
      description: _('Copies the diagram data to the clipboard in JSON format.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'rect',
            x: 0.3,
            y: 0.1,
            width: 0.7,
            height: 0.8,
            fill: '#666',
            stroke: '#333',
            strokeWidth: 0.02,
          },
          {
            shape: 'rect',
            x: 0.1,
            y: 0.2,
            width: 0.7,
            height: 0.8,
            fill: '#444',
            stroke: '#666',
            strokeWidth: 0.02,
          },
          {
            shape: 'text',
            text: 'JSON',
            textAnchor: 'right',
            dominantBaseline: 'bottom',
            fill: '#fff',
            fontSize: 0.3,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.copyJSONToClipboard(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'copy_svg',
      label: _('Copy SVG to clipboard'),
      description: _('Copies the diagram image to the clipboard in SVG format.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'rect',
            x: 0.3,
            y: 0.1,
            width: 0.7,
            height: 0.8,
            fill: '#666',
            stroke: '#333',
            strokeWidth: 0.02,
          },
          {
            shape: 'rect',
            x: 0.1,
            y: 0.2,
            width: 0.7,
            height: 0.8,
            fill: '#444',
            stroke: '#666',
            strokeWidth: 0.02,
          },
          {
            shape: 'text',
            text: 'SVG',
            textAnchor: 'right',
            dominantBaseline: 'bottom',
            fill: '#fff',
            fontSize: 0.3,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.copySVGToClipboard(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'download_json',
      label: _('Download JSON'),
      description: _('Download the diagram as a JSON file.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: `M 0.5 0.1 V 0.6
              M 0.35 0.45 L 0.5 0.6 L 0.65 0.45
              M 0.2 0.75 H 0.8 V 0.85 H 0.2 Z`,
            fill: false,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.downloadJsonHandler(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'upload',
      label: _('Upload'),
      description: _('Upload a diagram as a JSON file.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: `M 0.5 0.6 V 0.1
              M 0.35 0.25 L 0.5 0.1 L 0.65 0.25
              M 0.2 0.75 H 0.8 V 0.85 H 0.2 Z`,
            fill: false,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.uploadJson(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'share',
      label: _('Share'),
      description: _('Share the diagram as a URL.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'line',
            x1: 0.2, y1: 0.2,
            x2: 0.8, y2: 0.5,
          },
          {
            shape: 'line',
            x1: 0.2, y1: 0.8,
            x2: 0.8, y2: 0.5,
          },
          {
            shape: 'circle',
            cx: 0.2, cy: 0.2, r: 0.12,
          },
          {
            shape: 'circle',
            cx: 0.2, cy: 0.8, r: 0.12,
          },
          {
            shape: 'circle',
            cx: 0.8, cy: 0.5, r: 0.12,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.share(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'download_svg',
      label: _('Download SVG'),
      description: _('Download the diagram as a SVG image.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: 'M0.1 0.1 H0.9 V0.7 H0.1 Z',
            fill: '#555',
            stroke: '#333',
          },
          {
            shape: 'circle',
            cx: 0.2,
            cy: 0.2,
            r: 0.1,
            fill: '#ff0',
            stroke: false,
          },
          {
            shape: 'path',
            d: 'M0.15 0.7 L0.4 0.4 L0.6 0.6 L0.85 0.3 L0.9 0.7 Z',
            fill: '#666',
          },
          {
            shape: 'path',
            d: `M 0.5 0.4 V .95
              M 0.35 0.8 L 0.5 .95 L 0.65 0.8`,
          },
        ],
      },
      box: null,
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.downloadSvgHandler(),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'view',
      label: _('View'),
      description: _('View the diagram as a JSON data.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: `
              M0.1 0.5 Q0.5 0.1 0.9 0.5 Q0.5 0.9 0.1 0.5 Z
              M0.5 0.5 m-0.1 0 a0.1 0.1 0 1 0 0.2 0 a0.1 0.1 0 1 0 -0.2 0`,
          },
        ],
      },
      box: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
      draggable: false,
      exportable: false,
      onClick: () => this.view({ selected: true}),
    }),

    new Item({
      type: 'tool',
      visible: false,
      name: 'view_in_console',
      label: _('View in console'),
      description: _('View the diagram in the browser\'s console.'),
      position: 'fixed',
      shape: {
        shapes: [
          {
            shape: 'path',
            d: 'M 0.05 0.05 H0.95 V0.95 H0.05 Z',
            fill: '#222',
          },
          {
            shape: 'path',
            d: 'M 0.1 0.1 H0.9 V0.6 H0.1 Z',
            fill: '#111',
          },
          {
            shape: 'path',
            d: 'M 0.15 0.65 L 0.3 0.8 L 0.15 0.95',
            stroke: '#0f0',
          },
        ],
      },
      box: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
      selectable: false,
      draggable: false,
      exportable: false,
      onClick: () => this.viewInConsole({ selected: true}),
    }),
  ];

  onSave = null;

  constructor({ container, actdia }) {
    this.container = container;
    this.actdia = actdia;
    this.create();
  }

  create() {
    this.toolsElement = document.createElement('div');
    this.toolsElement.classList.add('actdia-tools');
    this.container.appendChild(this.toolsElement);

    const options = { sx: 18, sy: 18 };
    const svgList = this.tools.map(tool => 
      '<div'
        + ` id="${escapeHTML(tool.id)}"`
        + ' class="button actdia-tool-button"'
        + ` data-id="${escapeHTML(tool.id)}"`
        + ` data-name="${escapeHTML(tool.name)}"`
        + ` title="${tool.description ? (tool.label ?? tool.name) + ':\n' + tool.description : (tool.label ?? tool.name)}"`
      + '>'
        + '<svg xmlns="http://www.w3.org/2000/svg"'
          + ' width="100%"'
          + ' height="100%"'
          + ' viewBox="0 0 20 20"'
        + '>'
          + this.actdia.getItemSVG(tool, options)
        + '</svg>'
      + '</div>'
    );

    this.toolsElement.innerHTML = svgList.join('');

    this.tools.forEach(tool => {
      const toolSVG = this.toolsElement.querySelector(`#${CSS.escape(tool.id)} svg`);
      tool.svgElement = toolSVG;
      tool.divElement = toolSVG.closest('div');
    });
    this.updateTools();

    this.toolsElement.addEventListener('click', evt => {
      const id = evt.target?.closest('.actdia-tool-button')?.dataset?.id;
      if (!id)
        return;

      const tool = this.tools.find(t => t.id === id);
      if (!tool)
        return;

      const onClick = tool?.onClick;
      if (onClick) {
        onClick();
        this.updateTools();
      }
    });
  }

  updateTools() {
    this.tools.forEach(tool => {
      tool.divElement.style.display = tool.visible === false ? 'none' : 'block';
    });
  }

  setChanged(changed) {
    const menuTool = this.tools.find(i => i.type === 'tool' && i.name === 'menu');
    if (!menuTool) {
      return;
    }

    const changedShape = menuTool.shape?.shapes.find(s => s.name === 'changed');
    if (changedShape) {
      changedShape.visible = !!changed;
      const path = menuTool.svgElement.querySelector('path[name="changed"]');
      if (changedShape.visible) {
        path.style.display = '';
        menuTool.divElement.title = _('Menu') + ':\n' + _('Diagram modified (unsaved changes).');
      } else {
        path.style.display = 'none';
        menuTool.divElement.title = _('Menu');
      }
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

  sendToBack(options) {
    const items = this.actdia.getItems({ onlySelected: true, ...options });
    this.actdia.sendToBack(...items);
  }
}