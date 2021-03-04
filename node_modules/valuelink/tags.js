"use strict";
/**
 * Linked React components for building forms implementing React 0.14 valueLink semantic.
 *
 * WTFPL License, (c) 2016 Vlad Balin, Volicon.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var setValue = function (x, e) { return e.target.value; };
var setBoolValue = function (x, e) { return Boolean(e.target.checked); };
/**
 * Wrapper for standard <input/> to be compliant with React 0.14 valueLink semantic.
 * Simple supports for link validation - adds 'invalid' class if link has an error.
 *
 *      <input type="checkbox" checkedLink={ linkToBool } />
 *      <input type="radio"    valueLink={ linkToSelectedValue } value="option1value" />
 *      <input type="text"     valueLink={ linkToString } />
 */
function validationClasses(props, value, error) {
    var classNames = props.className ? [props.className] : [];
    if (error) {
        classNames.push(props.invalidClass || 'invalid');
        if (value === '') {
            classNames.push(props.requiredClass || 'required');
        }
    }
    return classNames.join(' ');
}
function Input(props) {
    var valueLink = props.valueLink, checkedLink = props.checkedLink, rest = __rest(props, ["valueLink", "checkedLink"]), type = props.type, link = valueLink || checkedLink;
    switch (type) {
        case 'checkbox':
            return React.createElement("input", __assign({}, rest, { checked: Boolean(link.value), onChange: link.action(setBoolValue) }));
        case 'radio':
            return React.createElement("input", __assign({}, rest, { checked: link.value === props.value, onChange: function (e) { e.target.checked && link.set(props.value); } }));
        default:
            return React.createElement("input", __assign({}, rest, { className: validationClasses(rest, valueLink.value, valueLink.error), value: String(valueLink.value), onChange: valueLink.action(setValue) }));
    }
}
exports.Input = Input;
;
exports.isRequired = function (x) { return x != null && x !== ''; };
exports.isRequired.error = 'Required';
var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
exports.isEmail = function (x) { return Boolean(x.match(emailPattern)); };
exports.isEmail.error = 'Should be valid email';
var NumberInput = /** @class */ (function (_super) {
    __extends(NumberInput, _super);
    function NumberInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onKeyPress = function (e) {
            var charCode = e.charCode, _a = _this.props, integer = _a.integer, positive = _a.positive, allowed = (positive ? [] : [45]).concat(integer ? [] : [46]);
            if (e.ctrlKey)
                return;
            if (charCode && // allow control characters
                (charCode < 48 || charCode > 57) && // char is number
                allowed.indexOf(charCode) < 0) { // allowed char codes
                e.preventDefault();
            }
        };
        _this.onChange = function (e) {
            // Update local state...
            var value = e.target.value;
            _this.setValue(value);
            var asNumber = Number(value);
            if (value && !isNaN(asNumber)) {
                _this.props.valueLink.update(function (x) {
                    // Update link if value is changed
                    if (asNumber !== Number(x)) {
                        return asNumber;
                    }
                });
            }
        };
        return _this;
    }
    NumberInput.prototype.componentWillMount = function () {
        // Initialize component state
        this.setAndConvert(this.props.valueLink.value);
    };
    NumberInput.prototype.setValue = function (x) {
        // We're not using native state in order to avoid race condition.
        this.value = String(x);
        this.error = this.value === '' || isNaN(Number(x));
        this.forceUpdate();
    };
    NumberInput.prototype.setAndConvert = function (x) {
        var value = Number(x);
        if (this.props.positive) {
            value = Math.abs(x);
        }
        if (this.props.integer) {
            value = Math.round(value);
        }
        this.setValue(value);
    };
    NumberInput.prototype.componentWillReceiveProps = function (nextProps) {
        var next = nextProps.valueLink;
        if (Number(next.value) !== Number(this.value)) {
            this.setAndConvert(next.value); // keep state being synced
        }
    };
    NumberInput.prototype.render = function () {
        var _a = this.props, valueLink = _a.valueLink, positive = _a.positive, integer = _a.integer, props = __rest(_a, ["valueLink", "positive", "integer"]), error = valueLink.error || this.error;
        return React.createElement("input", __assign({}, props, { type: "text", className: validationClasses(props, this.value, error), value: this.value, onKeyPress: this.onKeyPress, onChange: this.onChange }));
    };
    return NumberInput;
}(React.Component));
exports.NumberInput = NumberInput;
/**
 * Wrapper for standard <textarea/> to be compliant with React 0.14 valueLink semantic.
 * Simple supports for link validation - adds 'invalid' class if link has an error.
 *
 *     <TextArea valueLink={ linkToText } />
 */
exports.TextArea = function (_a) {
    var valueLink = _a.valueLink, props = __rest(_a, ["valueLink"]);
    return (React.createElement("textarea", __assign({}, props, { className: validationClasses(props, valueLink.value, valueLink.error), value: valueLink.value, onChange: valueLink.action(setValue) })));
};
/**
 * Wrapper for standard <select/> to be compliant with React 0.14 valueLink semantic.
 * Regular <option/> tags must be used:
 *
 *     <Select valueLink={ linkToSelectedValue }>
 *         <option value="a">A</option>
 *         <option value="b">B</option>
 *     </Select>
 */
exports.Select = function (_a) {
    var valueLink = _a.valueLink, children = _a.children, props = __rest(_a, ["valueLink", "children"]);
    return (React.createElement("select", __assign({}, props, { value: valueLink.value, onChange: valueLink.action(setValue) }), children));
};
/**
 * Simple custom <Radio/> tag implementation. Can be easily styled.
 * Intended to be used with offhand bool link:
 *
 *    <Radio checkedLink={ linkToValue.equals( optionValue ) />
 */
exports.Radio = function (_a) {
    var _b = _a.className, className = _b === void 0 ? 'radio' : _b, checkedLink = _a.checkedLink, children = _a.children;
    return (React.createElement("div", { className: className + (checkedLink.value ? ' selected' : ''), onClick: checkedLink.action(function () { return true; }) }, children));
};
/**
 * Simple custom <Checkbox /> tag implementation.
 * Takes any type of boolean link. Can be easily styled.
 *
 *     <Checkbox checkedLink={ boolLink } />
 */
exports.Checkbox = function (_a) {
    var _b = _a.className, className = _b === void 0 ? 'checkbox' : _b, checkedLink = _a.checkedLink, children = _a.children;
    return (React.createElement("div", { className: className + (checkedLink.value ? ' selected' : ''), onClick: checkedLink.action(function (x) { return !x; }) }, children));
};
