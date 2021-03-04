"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInput = createInput;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react2 = _interopRequireDefault(require("input-format/react"));

var _core = require("libphonenumber-js/core");

var _inputValuePrefix = require("./helpers/inputValuePrefix");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function createInput(defaultMetadata) {
  function InputSmart(_ref, ref) {
    var country = _ref.country,
        international = _ref.international,
        withCountryCallingCode = _ref.withCountryCallingCode,
        metadata = _ref.metadata,
        rest = _objectWithoutProperties(_ref, ["country", "international", "withCountryCallingCode", "metadata"]);

    var format = (0, _react.useCallback)(function (value) {
      // "As you type" formatter.
      var formatter = new _core.AsYouType(country, metadata);
      var prefix = (0, _inputValuePrefix.getInputValuePrefix)({
        country: country,
        international: international,
        withCountryCallingCode: withCountryCallingCode,
        metadata: metadata
      }); // Format the number.

      var text = formatter.input(prefix + value);
      var template = formatter.getTemplate();

      if (prefix) {
        text = (0, _inputValuePrefix.removeInputValuePrefix)(text, prefix); // `AsYouType.getTemplate()` can be `undefined`.

        if (template) {
          template = (0, _inputValuePrefix.removeInputValuePrefix)(template, prefix);
        }
      }

      return {
        text: text,
        template: template
      };
    }, [country, metadata]);
    return _react["default"].createElement(_react2["default"], _extends({}, rest, {
      ref: ref,
      parse: _core.parsePhoneNumberCharacter,
      format: format
    }));
  }

  InputSmart = _react["default"].forwardRef(InputSmart);
  InputSmart.propTypes = {
    /**
     * A two-letter country code for formatting `value`
     * as a national phone number (e.g. `(800) 555 35 35`).
     * E.g. "US", "RU", etc.
     * If no `country` is passed then `value`
     * is formatted as an international phone number.
     * (e.g. `+7 800 555 35 35`)
     * Perhaps the `country` property should have been called `defaultCountry`
     * because if `value` is an international number then `country` is ignored.
     */
    country: _propTypes["default"].string,

    /**
     * If `country` property is passed along with `international={true}` property
     * then the phone number will be input in "international" format for that `country`
     * (without "country calling code").
     * For example, if `country="US"` property is passed to "without country select" input
     * then the phone number will be input in the "national" format for `US` (`(213) 373-4253`).
     * But if both `country="US"` and `international={true}` properties are passed then
     * the phone number will be input in the "international" format for `US` (`213 373 4253`)
     * (without "country calling code" `+1`).
     */
    international: _propTypes["default"].bool,

    /**
     * If `country` and `international` properties are set,
     * then by default it won't include "country calling code" in the input field.
     * To change that, pass `withCountryCallingCode` property,
     * and it will include "country calling code" in the input field.
     */
    withCountryCallingCode: _propTypes["default"].bool,

    /**
     * `libphonenumber-js` metadata.
     */
    metadata: _propTypes["default"].object.isRequired
  };
  InputSmart.defaultProps = {
    metadata: defaultMetadata
  };
  return InputSmart;
}

var _default = createInput();

exports["default"] = _default;
//# sourceMappingURL=InputSmart.js.map