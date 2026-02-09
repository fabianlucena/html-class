import Item from './item.js';
import Node from './node.js';
import Connection from './connection.js';

export function isItem(item) {
  return item instanceof Item || item?.constructor.name === 'Item';
}

export function isNode(item) {
  return item && (item instanceof Node || item?.constructor.name === 'Node');
}

export function isConnection(item) {
  return item && (item instanceof Connection || item?.constructor.name === 'Connection');
}
