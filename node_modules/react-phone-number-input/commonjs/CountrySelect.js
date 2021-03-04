"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = CountrySelect;
exports.CountrySelectWithIcon = CountrySelectWithIcon;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _unicode = _interopRequireDefault(require("country-flag-icons/unicode"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function CountrySelect(_ref) {
  var value = _ref.value,
      onChange = _ref.onChange,
      options = _ref.options,
      rest = _objectWithoutProperties(_ref, ["value", "onChange", "options"]);

  var onChange_ = (0, _react.useCallback)(function (event) {
    var value = event.target.value;
    onChange(value === 'ZZ' ? undefined : value);
  }, [onChange]);
  var selectedOption = (0, _react.useMemo)(function () {
    return getSelectedOption(options, value);
  }, [options, value]); // "ZZ" means "International".
  // (HTML requires each `<option/>` have some string `value`).

  return _react["default"].createElement("select", _extends({}, rest, {
    value: value || 'ZZ',
    onChange: onChange_
  }), options.map(function (_ref2) {
    var value = _ref2.value,
        label = _ref2.label,
        divider = _ref2.divider;
    return _react["default"].createElement("option", {
      key: divider ? '|' : value || 'ZZ',
      value: divider ? '|' : value || 'ZZ',
      disabled: divider ? true : false,
      style: divider ? DIVIDER_STYLE : undefined
    }, label);
  }));
}

CountrySelect.propTypes = {
  /**
   * A two-letter country code.
   * Example: "US", "RU", etc.
   */
  value: _propTypes["default"].string,

  /**
   * Updates the `value`.
   */
  onChange: _propTypes["default"].func.isRequired,
  // `<select/>` options.
  options: _propTypes["default"].arrayOf(_propTypes["default"].shape({
    value: _propTypes["default"].string,
    label: _propTypes["default"].string,
    divider: _propTypes["default"].bool
  })).isRequired
};
var DIVIDER_STYLE = {
  fontSize: '1px',
  backgroundColor: 'currentColor',
  color: 'inherit'
};

function CountrySelectWithIcon(_ref3) {
  var value = _ref3.value,
      options = _ref3.options,
      className = _ref3.className,
      Icon = _ref3.iconComponent,
      getIconAspectRatio = _ref3.getIconAspectRatio,
      Arrow = _ref3.arrowComponent,
      unicodeFlags = _ref3.unicodeFlags,
      rest = _objectWithoutProperties(_ref3, ["value", "options", "className", "iconComponent", "getIconAspectRatio", "arrowComponent", "unicodeFlags"]);

  var selectedOption = (0, _react.useMemo)(function () {
    return getSelectedOption(options, value);
  }, [options, value]);
  return _react["default"].createElement("div", {
    className: "PhoneInputCountry"
  }, _react["default"].createElement(CountrySelect, _extends({}, rest, {
    value: value,
    options: options,
    className: (0, _classnames["default"])('PhoneInputCountrySelect', className)
  })), unicodeFlags && value && _react["default"].createElement("div", {
    className: "PhoneInputCountryIconUnicode"
  }, (0, _unicode["default"])(value)), !(unicodeFlags && value) && _react["default"].createElement(Icon, {
    country: value,
    label: selectedOption && selectedOption.label,
    aspectRatio: unicodeFlags ? 1 : undefined
  }), _react["default"].createElement(Arrow, null));
}

CountrySelectWithIcon.propTypes = {
  // Country flag component.
  iconComponent: _propTypes["default"].elementType,
  // Select arrow component.
  arrowComponent: _propTypes["default"].elementType.isRequired,
  // Set to `true` to render Unicode flag icons instead of SVG images.
  unicodeFlags: _propTypes["default"].bool
};
CountrySelectWithIcon.defaultProps = {
  // Is "International" icon square?
  arrowComponent: function arrowComponent() {
    return _react["default"].createElement("div", {
      className: "PhoneInputCountrySelectArrow"
    });
  }
};

function getSelectedOption(options, value) {
  for (var _iterator = options, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref4;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref4 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref4 = _i.value;
    }

    var option = _ref4;

    if (!option.divider && option.value === value) {
      return option;
    }
  }
}
//# sourceMappingURL=CountrySelect.js.map