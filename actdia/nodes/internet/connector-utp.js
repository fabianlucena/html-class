import Connector from '../../actdia/connector.js';

export default class ConnectorUtp extends Connector {
  type = 'utp';
  accepts = [ 'in' ];
  multiple = false;
}
