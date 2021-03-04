"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labels = exports.metadata = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var metadata = _propTypes["default"].shape({
  country_calling_codes: _propTypes["default"].object.isRequired,
  countries: _propTypes["default"].object.isRequired
});

exports.metadata = metadata;

var labels = _propTypes["default"].objectOf(_propTypes["default"].string);

exports.labels = labels;
//# sourceMappingURL=PropTypes.js.map