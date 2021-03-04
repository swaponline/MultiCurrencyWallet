"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPhoneInput = createPhoneInput;
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _en = _interopRequireDefault(require("../locale/en.json"));

var _PropTypes = require("./PropTypes");

var _PhoneInputWithCountry = _interopRequireDefault(require("./PhoneInputWithCountry"));

var _CountrySelect = require("./CountrySelect");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function createPhoneInput(defaultMetadata) {
  var PhoneInputDefault = _react["default"].forwardRef(function (props, ref) {
    return _react["default"].createElement(_PhoneInputWithCountry["default"], _extends({
      ref: ref
    }, props));
  });

  PhoneInputDefault.propTypes = {
    metadata: _PropTypes.metadata.isRequired,
    labels: _PropTypes.labels.isRequired,
    countrySelectComponent: _propTypes["default"].elementType.isRequired
  };
  PhoneInputDefault.defaultProps = {
    metadata: defaultMetadata,
    labels: _en["default"],
    countrySelectComponent: _CountrySelect.CountrySelectWithIcon
  };
  return PhoneInputDefault;
}

var _default = createPhoneInput();

exports["default"] = _default;
//# sourceMappingURL=PhoneInputWithCountryDefault.js.map