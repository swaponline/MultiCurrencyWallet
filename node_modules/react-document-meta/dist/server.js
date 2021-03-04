'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rewindAsStaticMarkup() {
  var tags = (0, _index.render)(_index2.default.rewind());

  return (0, _server.renderToStaticMarkup)(_react2.default.createElement(
    'div',
    null,
    tags
  )).replace(/(^<div>|<\/div>$)/g, '').replace(/data-rdm="true"/g, 'data-rdm');
}

exports.default = _index2.default;


_index2.default.renderToStaticMarkup = rewindAsStaticMarkup;
_index2.default.renderAsHTML = rewindAsStaticMarkup;
module.exports = exports['default'];
