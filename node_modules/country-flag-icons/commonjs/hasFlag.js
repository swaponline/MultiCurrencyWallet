"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = hasFlag;

var _countries = _interopRequireDefault(require("./countries.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function hasFlag(country) {
  return _countries["default"].indexOf(country) >= 0;
}
//# sourceMappingURL=hasFlag.js.map