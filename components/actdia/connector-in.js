import Connector from './connector.js';
import { deepCopy } from '../utils/object.js';

export default class ConnectorIn extends Connector {
  type = 'in';
  accepts = [ 'out' ];
  multiple = false;
  isInput = true;
}
