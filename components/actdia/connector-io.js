import Connector from './connector.js';

export default class ConnectorIO extends Connector {
  type = 'io';
  accepts = [ 'io', 'in', 'out' ];
  multiple = true;
}
