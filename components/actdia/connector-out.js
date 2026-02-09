import Connector from './connector.js';

export default class ConnectorOut extends Connector {
  type = 'out';
  accepts = [ 'in' ];
  multiple = false;
}
