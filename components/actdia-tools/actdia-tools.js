import { importCss } from '../utils/import-css.js';
import { escapeHTML, sanitizeId } from '../utils/html.js';
import Dialog from '../dialog/dialog.js';
import { _, _c } from '../locale/locale.js';
import { pushNotification } from '../notistack/notistack.js';
import { getPath } from '../utils/path.js';
import { isConnection, isNode } from '../actdia/type.js';
import { newId } from '../utils/id.js';

importCss('./actdia-tools.css', import.meta.url);
const basePath = getPath(import.meta.url);

export default class ActDiaTools {
  menuTool = {
    name: 'menu',
    label: _('Menu'),
    svg: basePath + '/icons/menu.svg',
  };

  markerOptions = [
    { value: '', label: '— ' + _('None') },
    { value: 'arrow', label: '→ ' + _('Arrow') },
    { value: 'circle', label: ' ● ' + _('Circle') },
    { value: 'square', label: ' ■ ' + _('Square') },
    { value: 'diamond', label: ' ◆ ' + _('Diamond') },
    { value: 'triangle', label: ' ▶ ' + _('Triangle') },
    { value: 'circledDot', label: ' ◉ ' + _('Circled dot') },
    { value: 'slash', label: ' ⟋ ' + _('Slash') },
    { value: 'x', label: ' ✕ ' + _('X') },
  ];

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
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.horizontalFlip(),
        },
        {
          name: 'verticalFlip',
          label: _('Vertical flip'),
          description: _('Flips the selected item vertically.'),
          svg: basePath + '/icons/vertical-flip.svg',
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.verticalFlip(),
        },
        {
          name: 'bringToFront',
          label: _('Bring to front'),
          description: _('Brings the selected item to the front of the diagram.'),
          svg: basePath + '/icons/bring-to-front.svg',
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.bringToFront(),
        },
        {
          name: 'bringForward',
          label: _('Bring forward'),
          description: _('Brings the selected item one level forward in the diagram.'),
          svg: basePath + '/icons/bring-forward.svg',
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.bringForward(),
        },
        {
          name: 'sendBackward',
          label: _('Send backward'),
          description: _('Sends the selected item one level back in the diagram.'),
          svg: basePath + '/icons/send-backward.svg',
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.sendBackward(),
        },
        {
          name: 'sendToBack',
          label: _('Send to back'),
          description: _('Sends the selected item to the back of the diagram.'),
          svg: basePath + '/icons/send-to-back.svg',
          update: this.enableForAnySelectedNodeHideForConnection,
          onClick: () => this.sendToBack(),
        },
        {
          name: 'rotateCW',
          label: _('Rotate clockwise'),
          description: _('Rotates the selected item 90 degrees clockwise.'),
          svg: basePath + '/icons/rotate-cw.svg',
          update: data => {
            if (!this.enableForAnySelectedNodeHideForConnection(data))
              return;
            
            const disabled = !data.selectedNodes.some(n => n.canRotate);
            data.tool.disabled = disabled;
            data.tool.element.classList.toggle('disabled', disabled);
          },
          onClick: () => this.rotateCW(),
        },
        {
          name: 'rotateCCW',
          label: _('Rotate counterclockwise'),
          description: _('Rotates the selected item 90 degrees counterclockwise.'),
          svg: basePath + '/icons/rotate-ccw.svg',
          update: data => {
            if (!this.enableForAnySelectedNodeHideForConnection(data))
              return;
            
            const disabled = !data.selectedNodes.some(n => n.canRotate);
            data.tool.disabled = disabled;
            data.tool.element.classList.toggle('disabled', disabled);
          },
          onClick: () => this.rotateCCW(),
        },
        {
          name: 'x',
          label: 'X',
          description: _('X coord of the item.'),
          type: 'number',
          min: 0,
          update: this.enableForAnySelectedNodeHideForConnection,
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getItems({ onlySelected: true });
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
          update: this.enableForAnySelectedNodeHideForConnection,
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getItems({ onlySelected: true });
            nodes.forEach(node => {
              node.y = value;
              node.updateTransform();
            });
          },
        },
        {
          name: 'width',
          label: _c('width','W'),
          description: _('Width of the item.'),
          type: 'number',
          min: 0,
          update: data => {
            if (!this.enableForAnySelectedNodeHideForConnection(data))
              return;

            const disabled = !data.selectedNodes.some(n => n.canChangeSize || n.canChangeWidth);
            data.tool.disabled = disabled;
            data.tool.element.classList.toggle('disabled', disabled);
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getItems({ onlySelected: true });
            nodes.forEach(node => {
              node.width = value;
              node.updateTransform();
            });
          },
        },
        {
          name: 'height',
          label: _c('height','H'),
          description: _('Height of the item.'),
          type: 'number',
          min: 0,
          update: data => {
            if (!this.enableForAnySelectedNodeHideForConnection(data))
              return;

            const disabled = !data.selectedNodes.some(n => n.canChangeSize || n.canChangeHeight);
            data.tool.disabled = disabled;
            data.tool.element.classList.toggle('disabled', disabled);
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const nodes = this.actdia.getItems({ onlySelected: true });
            nodes.forEach(node => {
              node.height = value;
              node.updateTransform();
            });
          },
        },
        { 
          name: 'path',
          label: _('Path'),
          description: _('Path design.'),
          type: 'select',
          options: [
            { value: '', label: ' ' + _('None') },
            { value: 'smooth', label: ' ∿ ' + _('Smooth') }, 
            { value: 'orthogonal', label: ' ┘ ' + _('Orthogonal') },
            { value: 'straight', label: '⟋ ' + _('Straight') },
          ],
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const value = selectedConnections
              .find(c => c.path)?.path || '';
            
            tool.input.value = value;
          },
          onChange: evt => {
            const value = evt.target.value;
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              connection.path = value;
              connection.update();
            });
          },
        },
        {
          name: 'gapBoth',
          label: _('Gap both'),
          description: _('Endpoint offset from the node.'),
          type: 'number',
          min: -.01,
          step: 0.01,
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const value = selectedConnections
              .find(c => c.gap)?.gap || 0;
            
            tool.input.value = value;
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              if (value < 0) {
                delete connection.gap;
              } else {
                connection.gap = value;
              }
              connection.update();
            });
          },
        },
        {
          name: 'markerStart',
          label: _('Start'),
          description: _('Draw the marker start of the connection.'),
          type: 'select',
          options: this.markerOptions,
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const connection = selectedConnections
              .find(c => c.markerStart);
            
            tool.input.value = connection?.markerStart || '';
          },
          onChange: evt => {
            const value = evt.target.value;
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              if (value) {
                connection.markerStart = value;
              } else {
                delete connection.markerStart;
              }

              connection.update();
            });
          },
        },
        {
          name: 'gapStart',
          label: _('Gap start'),
          description: _('Endpoint offset from the node to the start marker.'),
          type: 'number',
          min: -.01,
          step: .01,
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const value = selectedConnections
              .find(c => c.gapStart)?.gapStart || 0;
            
            tool.input.value = value;
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              if (value < 0) {
                delete connection.gapStart;
              } else {
                connection.gapStart = value;
              }
              connection.update();
            });
          },
        },
        {
          name: 'markerEnd',
          label: _('End'),
          description: _('Draw the marker end of the connection.'),
          type: 'select',
          options: this.markerOptions,
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const connection = selectedConnections
              .find(c => c.markerEnd);
            
            tool.input.value = connection?.markerEnd || '';
          },
          onChange: evt => {
            const value = evt.target.value;
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              if (value) {
                connection.markerEnd = value;
              } else {
                delete connection.markerEnd;
              }

              connection.update();
            });
          },
        },
        {
          name: 'gapEnd',
          label: _('Gap end'),
          description: _('Endpoint offset from the node to the end marker.'),
          type: 'number',
          min: -.01,
          step: .01,
          update: data => {
            if (!this.showForConnectionsOnly(data))
              return;

            const {tool, selectedConnections} = data;
            const value = selectedConnections
              .find(c => c.endGap)?.endGap || 0;
            
            tool.input.value = value;
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const connections = this.actdia.getItems({ onlySelected: true, onlyConnections: true });
            connections.forEach(connection => {
              if (value < 0) {
                delete connection.endGap;
              } else {
                connection.endGap = value;
              }
              connection.update();
            });
          },
        },
      ],
    },
    {
      name: 'style',
      label: _('Style'),
      title: _('Style options'),
      tools: [
        {
          name: 'style.strokeWidth',
          label: _('Stroke width'),
          description: _('Stroke width of the connection.'),
          type: 'number',
          min: 0,
          step: 0.01,
          update: data => {
            if (!this.enableForAnySelectedItem(data))
              return;

            const {tool, selectedItems} = data;
            const values = selectedItems
              .map(c => c.style?.strokeWidth)
              .filter(v => v && !isNaN(v) && isFinite(v));
            
            tool.input.value = values.length ? 
              (values.reduce((a, b) => a + b, 0) / values.length)
              : '';
          },
          onChange: evt => {
            const value = parseFloat(evt.target.value);
            const items = this.actdia.getItems({ onlySelected: true });
            items.forEach(item => {
              item.style ??= {};
              item.style.strokeWidth = value;
              item.update();
            });
          },
        },
        {
          name: 'style.dash',
          label: _('Dash'),
          description: _('Dash of the connection.'),
          type: 'text',
          update: data => {
            if (!this.enableForAnySelectedItem(data))
              return;

            const {tool, selectedItems} = data;
            const values = selectedItems
              .map(c => c.style?.dash)
              .filter(v => v && !isNaN(v) && isFinite(v));
            
            tool.input.value = values.length ? 
              (values.reduce((a, b) => a + b, 0) / values.length)
              : '';
          },
          onChange: evt => {
            const value = evt.target.value.split(/[, ]+/).map(s => parseFloat(s.trim()));
            const items = this.actdia.getItems({ onlySelected: true });
            items.forEach(item => {
              item.style ??= {};
              item.style.dash = value;
              item.update();
            });
          },
        },
      ],
    },
    {
      name: 'document',
      label: _('Document'),
      title: _('Document options'),
      tools: [
        {
          name: 'documentSX',
          label: _('Scale'),
          description: _('Scale of the draw.'),
          type: 'number',
          step: .1,
          min: 0,
          update: ({tool}) => tool.input.value = this.actdia.style?.sx || '',
          onChange: evt => {
            this.actdia.style ??= {};
            this.actdia.style.sx = parseFloat(evt.target.value);
            this.actdia.update();
          },
        },
        {
          name: 'documentSY',
          label: _(''),
          type: 'number',
          step: .1,
          min: 0,
          update: ({tool}) => tool.input.value = this.actdia.style?.sy || '',
          onChange: evt => {
            this.actdia.style ??= {};
            this.actdia.style.sy = parseFloat(evt.target.value);
            this.actdia.update();
          },
        },
        { 
          name: 'documentPath',
          label: _('Path'),
          description: _('Path design.'),
          type: 'select',
          options: [
            { value: '', label: ' ' + _('None') },
            { value: 'smooth', label: ' ∿ ' + _('Smooth') }, 
            { value: 'orthogonal', label: ' ┘ ' + _('Orthogonal') },
            { value: 'straight', label: '⟋ ' + _('Straight') },
          ],
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.path || '',
          onChange: evt => {
            this.actdia.style.connection ??= {};
            this.actdia.style.connection.path = evt.target.value;
            
            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
        {
          name: 'documentGapBoth',
          label: _('Gap both'),
          description: _('Endpoint offset from the node.'),
          type: 'number',
          min: -.01,
          step: 0.01,
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.gap || '',
          onChange: evt => {
            const value = evt.target.value;
            if (value >= 0) {
              this.actdia.style.connection ??= {};
              this.actdia.style.connection.gap = value;
            } else {
              delete this.actdia.style.connection?.gap;
            }
            
            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
        {
          name: 'documentMarkerStart',
          label: _('Start'),
          description: _('Draw the start marker for all connections.'),
          type: 'select',
          options: this.markerOptions,
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.markerStart || '',
          onChange: evt => {
            const value = evt.target.value;
            if (value) {
              this.actdia.style.connection ??= {};
              this.actdia.style.connection.markerStart = value;
            } else {
              delete this.actdia.style.connection?.markerStart;
            }
            
            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
        {
          name: 'documentGapStart',
          label: _('Gap start'),
          description: _('Endpoint offset from the node.'),
          type: 'number',
          min: -.01,
          step: 0.01,
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.gapStart || '',
          onChange: evt => {
            const value = evt.target.value;
            if (value >= 0) {
              this.actdia.style.connection ??= {};
              this.actdia.style.connection.gapStart = value;
            } else {
              delete this.actdia.style.connection?.gapStart;
            }
            
            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
        {
          name: 'documentMarkerEnd',
          label: _('End'),
          description: _('Draw the end marker for all connections.'),
          type: 'select',
          options: this.markerOptions,
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.markerEnd || '',
          onChange: evt => {
            const value = evt.target.value;
            if (value) {
              this.actdia.style.connection ??= {};
              this.actdia.style.connection.markerEnd = value;
            } else {
              delete this.actdia.style.connection?.markerEnd;
            }

            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
        {
          name: 'documentGapEnd',
          label: _('Gap end'),
          description: _('Endpoint offset from the node.'),
          type: 'number',
          min: -.01,
          step: 0.01,
          update: ({tool}) => tool.input.value = this.actdia.style.connection?.gapEnd || '',
          onChange: evt => {
            const value = evt.target.value;
            if (value) {
              this.actdia.style.connection ??= {};
              this.actdia.style.connection.gapEnd = value;
            } else {
              delete this.actdia.style.connection?.gapEnd;
            }
            
            const connections = this.actdia.getItems({ onlyConnections: true });
            connections.forEach(connection => connection.update());
          },
        },
      ],
    }
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
      anySelectedItem: selectedItems.length > 0,
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
          tool.nodes = [...selectedNodes];
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

      if (tool.type === 'number' || tool.type === 'text' || tool.type === 'checkbox' || tool.type === 'select') {
        const inputId = sanitizeId(newId());
        
        element.classList.add('actdia-tool-input');
        tool.labelElement = document.createElement('label');
        tool.labelElement.textContent = tool.label;
        tool.labelElement.htmlFor = inputId;
        element.appendChild(tool.labelElement);

        let input;
        if (tool.type === 'number' || tool.type === 'text' || tool.type === 'checkbox') {
          tool.input = document.createElement('input');
          input = tool.input;
          input.id = inputId;
          input.classList.add('actdia-tool-input');
          input.type = tool.type;
          if (tool.type === 'number') {
            input.min = tool.min ?? 0;
            input.max = tool.max ?? '';
            input.step = tool.step ?? '';
          }
          input.value = tool.value ?? '';
          input.addEventListener('input', evt => {
            tool.onChange?.(evt);
            tool.nodes?.forEach(n => n.update?.());
          });
        } else if (tool.type === 'select') {
          tool.input = document.createElement('select');
          input = tool.input;
          for (const optionData of tool.options) {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.label;
            tool.input.appendChild(option);
          }
          input.value = tool.value ?? '';
          input.addEventListener('change', evt => {
            tool.onChange?.(evt);
            tool.nodes?.forEach(n => n.update?.());
          });
        }

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

  async clickHandler(evt) {
    const name = evt.target?.closest('.actdia-tool-button')?.dataset?.name;
    if (name) {
      const tool = this.getToolByName(name);
      if (tool) {
        if (tool.disabled)
          return;

        const onClick = tool?.onClick;
        if (onClick) {
          try {
            await onClick();
          } catch (err) {
            pushNotification(_('Error executing tool action: %s', err), 'error');
            console.error('Error executing tool onClick handler:', err);
          }
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

  async downloadSvgHandler(options) {
    if (!this.getExportableItems({ onlySelected: true }).length) {
      await this.downloadSvg({ selected: false});
      return;
    }

    const dialog  = new Dialog({
      container: this.container,
      header: _('Export dialog'),
      content: `<p>${_('Do you want to export the entire diagram or only the selected items?')}</p>
        <button id="export-all" class="button">${_('Export all')}</button>
        <button id="export-selected" class="button">${_('Export selected')}</button>`,

      onClick: async evt => {
        try {
          if (evt.target.closest('#export-all')) {
            await this.downloadSvg({ selected: false});
            dialog.close();
          } else if (evt.target.closest('#export-selected')) {
            await this.downloadSvg({ selected: true});
            dialog.close();
          }
        } catch (err) {
          pushNotification(_('Error executing tool action: %s', err), 'error');
          console.error('Error executing tool onClick handler:', err);
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

  enableForAnySelectedItem({tool, anySelectedItem}) {
    tool.disabled = !anySelectedItem;
    tool.element.classList.toggle('disabled', !anySelectedItem);
  }

  enableForAnySelectedNode({tool, anySelectedNode}) {
    tool.disabled = !anySelectedNode;
    tool.element.classList.toggle('disabled', !anySelectedNode);
  }

  enableForAnySelectedNodeHideForConnection({tool, anySelectedNode, anySelectedConnection, selectedNodes}) {
    if (anySelectedNode) {
      tool.element.classList.remove('hidden');
      tool.disabled = false;
      tool.element.classList.remove('disabled');
      return true;
    }
    
    if (anySelectedConnection) {
      tool.element.classList.add('hidden');
    } else {
      tool.element.classList.remove('hidden');
      tool.disabled = !anySelectedNode;
      tool.element.classList.toggle('disabled', !anySelectedNode);
    }

    return false;
  }

  enableForSingleSelectedNodeHideForConnection({tool, selectedNode, anySelectedConnection}) {
    if (selectedNode) {
      tool.element.classList.remove('hidden');
      tool.disabled = false;
      tool.element.classList.remove('disabled');
      return true;
    }

    if (anySelectedConnection) {
      tool.element.classList.add('hidden');
    } else {
      tool.element.classList.remove('hidden');
      tool.disabled = !selectedNode;
      tool.element.classList.toggle('disabled', !selectedNode);
    }
    
    return false;
  }

  showForConnectionsOnly({tool, anySelectedConnection}) {
    if (anySelectedConnection) {
      tool.element.classList.remove('hidden');
      return true;
    }
    
    tool.element.classList.add('hidden');
    return false;
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