import Connector from './connector.js';

export default class ConnectorIn extends Connector {
  type = 'in';
  accepts = [ 'out' ];
  multiple = false;
}
