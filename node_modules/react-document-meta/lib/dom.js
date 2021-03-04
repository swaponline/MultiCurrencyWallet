import { forEach } from './utils';

export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

function removeNode(node) {
  node.parentNode.removeChild(node);
}

export function removeDocumentMeta() {
  forEach(document.querySelectorAll('head [data-rdm]'), removeNode);
}

function insertDocumentMetaNode(entry) {
  const { tagName, ...attr } = entry;

  var newNode = document.createElement(tagName);
  for (var prop in attr) {
    if (entry.hasOwnProperty(prop)) {
      newNode.setAttribute(prop, entry[prop]);
    }
  }
  newNode.setAttribute('data-rdm', '');
  document.getElementsByTagName('head')[0].appendChild(newNode);
}

export function insertDocumentMeta(nodes) {
  removeDocumentMeta();

  forEach(nodes, insertDocumentMetaNode);
}
