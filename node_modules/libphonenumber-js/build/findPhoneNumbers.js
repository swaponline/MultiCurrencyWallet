"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findPhoneNumbers;
exports.searchPhoneNumbers = searchPhoneNumbers;

var _findPhoneNumbers_ = _interopRequireWildcard(require("./findPhoneNumbers_"));

var _parsePhoneNumber = require("./parsePhoneNumber");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

// This is a legacy function.
// Use `findNumbers()` instead.
function findPhoneNumbers() {
  var _normalizeArguments = (0, _parsePhoneNumber.normalizeArguments)(arguments),
      text = _normalizeArguments.text,
      options = _normalizeArguments.options,
      metadata = _normalizeArguments.metadata;

  return (0, _findPhoneNumbers_["default"])(text, options, metadata);
}
/**
 * @return ES6 `for ... of` iterator.
 */


function searchPhoneNumbers() {
  var _normalizeArguments2 = (0, _parsePhoneNumber.normalizeArguments)(arguments),
      text = _normalizeArguments2.text,
      options = _normalizeArguments2.options,
      metadata = _normalizeArguments2.metadata;

  return (0, _findPhoneNumbers_.searchPhoneNumbers)(text, options, metadata);
}
//# sourceMappingURL=findPhoneNumbers.js.map