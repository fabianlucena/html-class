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

  saveStatus = false;
  saveFields = false;
  get skipExport() {
    const skip = super.skipExport;
    skip.push(
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
}