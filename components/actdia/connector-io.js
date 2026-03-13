import Connector from './connector.js';
import { deepCopy } from '../utils/object.js';

export default class ConnectorIO extends Connector {
  type = 'io';
  accepts = [ 'io', 'in', 'out' ];
  multiple = true;
  isInput = true;
  isOutput = true;
}
