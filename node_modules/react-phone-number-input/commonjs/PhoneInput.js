"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInput = createInput;
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _InputSmart = _interopRequireDefault(require("./InputSmart"));

var _InputBasic = _interopRequireDefault(require("./InputBasic"));

var _usePhoneDigits3 = _interopRequireDefault(require("./usePhoneDigits"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function createInput(defaultMetadata) {
  function PhoneInput(_ref, ref) {
    var country = _ref.country,
        defaultCountry = _ref.defaultCountry,
        useNationalFormatForDefaultCountryValue = _ref.useNationalFormatForDefaultCountryValue,
        value = _ref.value,
        onChange = _ref.onChange,
        metadata = _ref.metadata,
        smartCaret = _ref.smartCaret,
        international = _ref.international,
        withCountryCallingCode = _ref.withCountryCallingCode,
        rest = _objectWithoutProperties(_ref, ["country", "defaultCountry", "useNationalFormatForDefaultCountryValue", "value", "onChange", "metadata", "smartCaret", "international", "withCountryCallingCode"]);

    // "Phone digits" includes not only "digits" but also a `+` sign.
    var _usePhoneDigits = (0, _usePhoneDigits3["default"])({
      value: value,
      onChange: onChange,
      country: country,
      defaultCountry: defaultCountry,
      international: international,
      withCountryCallingCode: withCountryCallingCode,
      useNationalFormatForDefaultCountryValue: useNationalFormatForDefaultCountryValue,
      metadata: metadata
    }),
        _usePhoneDigits2 = _slicedToArray(_usePhoneDigits, 2),
        phoneDigits = _usePhoneDigits2[0],
        setPhoneDigits = _usePhoneDigits2[1];

    var InputComponent = smartCaret ? _InputSmart["default"] : _InputBasic["default"];
    return _react["default"].createElement(InputComponent, _extends({}, rest, {
      ref: ref,
      metadata: metadata,
      international: international,
      withCountryCallingCode: withCountryCallingCode,
      country: country || defaultCountry,
      value: phoneDigits,
      onChange: setPhoneDigits
    }));
  }

  PhoneInput = _react["default"].forwardRef(PhoneInput);
  PhoneInput.propTypes = {
    /**
     * HTML `<input/>` `type` attribute.
     */
    type: _propTypes["default"].string,

    /**
     * HTML `<input/>` `autocomplete` attribute.
     */
    autoComplete: _propTypes["default"].string,

    /**
     * The phone number (in E.164 format).
     * Examples: `undefined`, `"+12"`, `"+12133734253"`.
     */
    value: _propTypes["default"].string,

    /**
     * Updates the `value`.
     */
    onChange: _propTypes["default"].func.isRequired,

    /**
     * A two-letter country code for formatting `value`
     * as a national phone number (example: `(213) 373-4253`),
     * or as an international phone number without "country calling code"
     * if `international` property is passed (example: `213 373 4253`).
     * Example: "US".
     * If no `country` is passed then `value`
     * is formatted as an international phone number.
     * (example: `+1 213 373 4253`)
     */
    country: _propTypes["default"].string,

    /**
     * A two-letter country code for formatting `value`
     * when a user inputs a national phone number (example: `(213) 373-4253`).
     * The user can still input a phone number in international format.
     * Example: "US".
     * `country` and `defaultCountry` properties are mutually exclusive.
     */
    defaultCountry: _propTypes["default"].string,

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
     * The `<input/>` component.
     */
    inputComponent: _propTypes["default"].elementType,

    /**
     * By default, the caret position is being "intelligently" managed
     * while a user inputs a phone number.
     * This "smart" caret behavior can be turned off
     * by passing `smartCaret={false}` property.
     * This is just an "escape hatch" for any possible caret position issues.
     */
    // Is `true` by default.
    smartCaret: _propTypes["default"].bool.isRequired,

    /**
     * When `defaultCountry` is defined and the initial `value` corresponds to `defaultCountry`,
     * then the `value` will be formatted as a national phone number by default.
     * To format the initial `value` of `defaultCountry` as an international number instead
     * set `useNationalFormatForDefaultCountryValue` property to `true`.
     */
    useNationalFormatForDefaultCountryValue: _propTypes["default"].bool.isRequired,

    /**
     * `libphonenumber-js` metadata.
     */
    metadata: _propTypes["default"].object.isRequired
  };
  PhoneInput.defaultProps = {
    /**
     * HTML `<input/>` `type="tel"`.
     */
    type: 'tel',

    /**
     * Remember (and autofill) the value as a phone number.
     */
    autoComplete: 'tel',

    /**
     * Set to `false` to use "basic" caret instead of the "smart" one.
     */
    smartCaret: true,

    /**
     * Set to `true` to force international phone number format
     * (without "country calling code") when `country` is specified.
     */
    // international: false,

    /**
     * Prefer national format when formatting E.164 phone number `value`
     * corresponding to `defaultCountry`.
     */
    useNationalFormatForDefaultCountryValue: true,

    /**
     * `libphonenumber-js` metadata.
     */
    metadata: defaultMetadata
  };
  return PhoneInput;
}

var _default = createInput();

exports["default"] = _default;
//# sourceMappingURL=PhoneInput.js.map