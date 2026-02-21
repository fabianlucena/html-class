import Item from './item.js';
import Connector from './connector.js';
import { isEqual } from '../utils/type.js';
import { _ } from '../locale/locale.js';

export default class Node extends Item {
  shape = {
    shapes: [
    {
      x: 1,
      shape: 'rect',
      width: 9,
      height: 4,
      rx: .8,
      ry: .8,
    },
    {
      shape: 'path',
      d: `
        M0  2 L1  2 
        M10 2 L11 2`,
    },
    ],
  };

  box = {
    x: 0,
    y: 0,
    width: 11,
    height: 4,
  };

  connectors = [
    { type: 'in', x: 0, y: 2, direction: 'left' },
    { type: 'out', x: 11, y: 2, direction: 'right' },
  ];

  #inputs = [];
  #outputs = [];
  #clk = null;
  #clkStatus = null;
  
  #labeledStatusListenerInstalledIn = false;
  #labeledStatusListener = (label, status) => {
    if (label !== 'clk')
      return;

    const nodes = this.actdia.items
      .filter(i => i?.connectors
        ?.some(c => (c.name === 'clk' || c.name === '!clk') && !c.connections.length)
      );

    nodes.forEach(node => {
      node.connectors
        .filter(c => c.name === 'clk' || c.name === '!clk')
        .forEach(c => c.setStatus(status));
    });
  };

  canMove = true;
  canChangeSize = false;
  canChangeWidth = false;
  canChangeHeight = false;
  canRotate = true;
  canReflect = true;
  canChangeFill = true;
  canChengeStroke = true;
  commonFields = [
    {
      name: 'class',
      _label: 'Class',
      disabled: true,
      get: () => this.constructor.name,
    },
    {
      name: 'id',
      _label: 'ID',
      disabled: true,
    },
    {
      name: 'name',
      _label: 'Name',
    },
    {
      name: 'description',
      _label: 'Description',
    },
    {
      name: 'coords',
      _label: 'Coordinates',
      type: 'text',
      get: () => this.getCoords(),
      set: (value) => this.setCoords(value),
      condition: () => this.canMove,
    },
    {
      name: 'width',
      type: 'number',
      _label: 'Width',
      min: 1,
      condition: () => this.canChangeSize || this.canChangeWidth,
    },
    {
      name: 'height',
      type: 'number',
      _label: 'Height',
      min: 1,
      condition: () => this.canChangeSize || this.canChangeHeight,
    },
    {
      name: 'rotate',
      _label: 'Rotate',
      type: 'select',
      options: [
        { value: 0, label: '0°' },
        { value: 90, label: '90°' },
        { value: 180, label: '180°' },
        { value: 270, label: '270°' },
      ],
      condition: () => this.canRotate,
    },
    {
      name: 'reflection',
      _label: 'Reflection',
      type: 'select',
      options: [
        { value: '[ 1,  1]', _label: 'None' },
        { value: '[ 1, -1]', _label: 'Horizontal' },
        { value: '[-1,  1]', _label: 'Vertical' },
        { value: '[-1, -1]', _label: 'Both' },
      ],
      condition: () => this.canReflect,
    },
    {
      name: 'style.fill',
      type: 'color',
      _label: 'Fill color',
      nullable: true,
      condition: () => this.canChangeFill,
    },
    {
      name: 'style.fillOpacity',
      type: 'range',
      _label: 'Fill opacity',
      min: 0,
      max: 1,
      step: 0.01,
      nullable: true,
      condition: () => this.canChangeFill,
    },
    {
      name: 'style.stroke',
      type: 'color',
      _label: 'Stroke color',
      nullable: true,
      condition: () => this.canChengeStroke,
    },
    {
      name: 'style.strokeWidth',
      type: 'number',
      _label: 'Line width',
      nullable: true,
      condition: () => this.canChengeStroke,
    },
    {
      name: 'style.dash',
      type: 'text',
      _label: 'Dash',
      nullable: true,
      condition: () => this.canChengeStroke,
    },
  ];

  get inputs() {
    return this.#inputs;
  }

  get outputs() {
    return this.#outputs;
  }

  get width() {
    return this.box.width;
  }

  set width(value) {
    this.setWidth(value);
  }

  get height() {
    return this.box.height;
  }

  set height(value) {
    this.setHeight(value);
  }

  init(options) {
    super.init();

    let connectorsData = [];
    for (let i = 0; i < arguments.length; i++) {
      if (!arguments[i])
        continue;
      
      const { connectors, ...arg } = arguments[i];
      if (connectors?.length) {
        connectorsData.push(...connectors);
      }
      Object.assign(this, arg);
    }

    this.connectors?.forEach((connector, index) => {
      if (!(connector instanceof Connector)) {
        this.connectors[index] = this.getNewConnector({ ...connector, index });
      }
    });

    connectorsData.forEach((data, index) => {
      while (index >= this.connectors.length) {
        this.addConnector();
      }
      
      const connector = this.connectors[index] || {};
      Object.assign(connector, data);

      this.connectors[index].item = this;
      this.connectors[index].index = index;
    });

    if (this.connectors?.length) {
      this.propagate();
    }
  }

  getNewConnector(connector) {
    const index = connector?.index ?? this.connectors.length;
    const root = (connector?.type || 'con') + '-';
    let counter = 0;
    let id = root + counter.toString().padStart(2, '0');
    while (this.connectors.find(c => c.id === id)) {
      counter++;
      id = root + counter.toString().padStart(2, '0');
    }

    const newConnector = Connector.create(
      this.defaultConnector,
      {
        index,
        item: this,
        actdia: this.actdia,
        id,
      },
      ...arguments,
    );

    return newConnector;
  }
  
  addConnector(connector) {
    const newConnector = this.getNewConnector(connector);
    newConnector.item = this;
    this.connectors.push(newConnector);
    this.update();
  }
  
  addInput(input) {
    input.type ??= 'in';
    this.addConnector(input);
  }

  addOutput(output) {
    output.type ??= 'out';
    this.addConnector(output);
  }

  removeLasConnectorByType(type) {
    for (let i = this.connectors.length - 1; i >= 0; i--) {
      const connector = this.connectors[i];
      if (connector.type === type) {
        this.connectors.splice(i, 1);
        if (connector.connections?.length) {
          this.actdia.deleteItem(...connector.connections);
        }

        this.update();
        break;
      }
    }
  }

  removeLastInput() {
    this.removeLasConnectorByType('in');
  }

  removeLastOutput() {
    this.removeLasConnectorByType('out');
  }

  getConnector(name) {
    return this.connectors.find(connector => connector.name === name);
  }

  getConnectorFromId(id) {
    return this.connectors.find(connector => connector.id === id);
  }

  getDefaultConnectorsData() {
    const classInfo = this.getElementClassInfo();
    if (!classInfo.defaultConnectorsData) {
      const defaultItem = this.getDefaultObject();
      classInfo.defaultConnectorsData = defaultItem.connectors;
    }

    return classInfo.defaultConnectorsData;
  }

  getConnectorsData() {
    if (!this.connectors.length)
      return;

    const defaultConnectorsData = this.getDefaultConnectorsData();

    const connectors = this.connectors.map(connector => {
      const { id, connections, item, index, actdia, status, ...currentData } = connector;
      let defaultConnector = defaultConnectorsData?.[index];
      if (!defaultConnector) {
        const { id, connections, item, index, ...data } =
          this.getNewConnector(connector) ?? {};

        defaultConnector = data;
      }

      let data = { id };
      
      for (const key in currentData) {
        if (!defaultConnector || !isEqual(currentData[key], defaultConnector[key])) {
          data[key] = currentData[key];
        }
      }

      return data;
    });

    return connectors;
  }

  update() {
    super.update();
    
    this.#inputs = this.connectors.filter(c => c.type === 'in');
    this.#outputs = this.connectors.filter(c => c.type === 'out');
    this.#clk = this.connectors.find(c => c.name === 'clk')
      || this.connectors.find(c => c.name === '!clk');

    if (this.#clk) {
      if (this.#labeledStatusListenerInstalledIn) {
        this.#labeledStatusListenerInstalledIn.removeLabeledStatusListener(this.#labeledStatusListener);
      }

      if (this.actdia) {
        this.actdia.addLabeledStatusListener(this.#labeledStatusListener);
        this.#labeledStatusListenerInstalledIn = this.actdia;
      }
    }
  }

  setWidth(value) {
    this.box.width = value;
    if (this.svgShape)
      this.actdia.tryUpdateShape(this);
  }

  setHeight(value) {
    this.box.height = value;
    if (this.svgShape)
      this.actdia.tryUpdateShape(this);
  }

  saveStatus = false;
  saveFields = false;
  get skipExport() {
    const skip = super.skipExport;
    skip.push(
      'commonFields',
      'connectors',
      'svgConnectors',
      'items',
      'defaultConnector',
    );

    if (!this.saveStatus)
      skip.push('status');

    if (!this.saveFields)
      skip.push('fields');
    
    return skip;
  }

  getData(options = {}) {
    const data = super.getData(options);

    const connectors = this.getConnectorsData();
    if (connectors?.length)
      data.connectors = connectors;
    
    return data;
  }

  updateStatus(options = {}) {
    if (this.#clk) {
      if (this.#clkStatus === null) {
        this.#clkStatus = this.#clk.status >= 0.5 ? 1 : 0;
      } else {
        if (this.#clk.status < 0.5) {
          if (this.#clkStatus !== 0) {
            this.#clkStatus = 0;
            this.updateStatusRSync(options);
          }
        } else if (this.#clk.status >= 0.5) {
          if (this.#clkStatus !== 1) {
            this.#clkStatus = 1;
            this.updateStatusSync(options);
          }
        }
      }
    }

    super.updateStatus(options);
  }

  updateStatusSync(options = {}) {}
  updateStatusRSync(options = {}) {}

  statusUpdated(options) {
    this.propagate(options);
  }

  backStatusUpdated(options) {
    this.backpropagate(options);
  }

  propagate(options = {}) {
    this.connectors
      .filter(c => c.type === 'out')
      .forEach(connector => connector?.setStatus?.(this.status, options));
  }

  backpropagate(options = {}) {
    this.connectors
      .filter(c => c.type === 'in')
      .forEach(connector => connector?.setBackStatus(this.backStatus, options));
  }

  getFields() {
    return [
      ...this.commonFields,
      ...this.fields || [],
    ].filter(field => !field.condition || field.condition());
  }
}