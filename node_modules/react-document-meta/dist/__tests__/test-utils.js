'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAttr = getAttr;
exports.getElement = getElement;
exports.getElements = getElements;
function getAttr(element, attr) {
  if (typeof element === 'string') {
    element = getElement(element);
  }

  return element && element.getAttribute(attr) || null;
}

function getElement(query) {
  return document.querySelector(query);
}

function getElements(query) {
  return document.querySelectorAll(query);
}
