import * as tslib_1 from "tslib";
/**
 * Advanced React links for purely functional two-way data binding
 *
 * MIT License, (c) 2016 Vlad Balin, Volicon.
 */
import { helpers, arrayHelpers } from './helpers';
// Main Link class. All links must extend it.
var Link = /** @class */ (function () {
    // create 
    function Link(value) {
        this.value = value;
    }
    // Create custom link to arbitrary value
    Link.value = function (value, set) {
        return new CustomLink(value, set);
    };
    Object.defineProperty(Link.prototype, "validationError", {
        // DEPRECATED: Old error holder for backward compatibility with Volicon code base
        get: function () { return this.error; },
        enumerable: true,
        configurable: true
    });
    Link.prototype.onChange = function (handler) {
        var _this = this;
        return new CloneLink(this, function (x) {
            handler(x);
            _this.set(x);
        });
    };
    Object.defineProperty(Link.prototype, "props", {
        // <input { ...link.props } />
        get: function () {
            var _this = this;
            return typeof this.value === 'boolean' ? {
                checked: this.value,
                onChange: function (e) { return _this.set(Boolean(e.target.checked)); }
            } : {
                value: this.value,
                onChange: function (e) { return _this.set(e.target.value); }
            };
        },
        enumerable: true,
        configurable: true
    });
    // DEPRECATED: Old React method for backward compatibility
    Link.prototype.requestChange = function (x) {
        this.set(x);
    };
    // Immediately update the link value using given transform function.
    Link.prototype.update = function (transform, e) {
        var next = transform(this.clone(), e);
        next === void 0 || this.set(next);
    };
    // Create new link which applies transform function on set.
    Link.prototype.pipe = function (handler) {
        var _this = this;
        return new CloneLink(this, function (x) {
            var next = handler(x, _this.value);
            next === void 0 || _this.set(next);
        });
    };
    // Create UI event handler function which will update the link with a given transform function.
    Link.prototype.action = function (transform) {
        var _this = this;
        return function (e) { return _this.update(transform, e); };
    };
    Link.prototype.equals = function (truthyValue) {
        return new EqualsLink(this, truthyValue);
    };
    Link.prototype.enabled = function (defaultValue) {
        return new EnabledLink(this, defaultValue || "");
    };
    // Array-only links methods
    Link.prototype.contains = function (element) {
        return new ContainsLink(this, element);
    };
    Link.prototype.push = function () {
        var array = arrayHelpers.clone(this.value);
        Array.prototype.push.apply(array, arguments);
        this.set(array);
    };
    Link.prototype.unshift = function () {
        var array = arrayHelpers.clone(this.value);
        Array.prototype.unshift.apply(array, arguments);
        this.set(array);
    };
    Link.prototype.splice = function () {
        var array = arrayHelpers.clone(this.value);
        Array.prototype.splice.apply(array, arguments);
        this.set(array);
    };
    Link.prototype.map = function (iterator) {
        return helpers(this.value).map(this, iterator);
    };
    Link.prototype.removeAt = function (key) {
        var value = this.value, _ = helpers(value);
        this.set(_.remove(_.clone(value), key));
    };
    Link.prototype.at = function (key) {
        return new LinkAt(this, key);
    };
    Link.prototype.clone = function () {
        var value = this.value;
        return helpers(value).clone(value);
    };
    Link.prototype.pick = function () {
        var links = {};
        for (var i = 0; i < arguments.length; i++) {
            var key = arguments[i];
            links[key] = new LinkAt(this, key);
        }
        return links;
    };
    /**
     * Validate link with validness predicate and optional custom error object. Can be chained.
     */
    Link.prototype.check = function (whenValid, error) {
        if (!this.error && !whenValid(this.value)) {
            this.error = error || whenValid.error || defaultError;
        }
        return this;
    };
    return Link;
}());
export { Link };
var CustomLink = /** @class */ (function (_super) {
    tslib_1.__extends(CustomLink, _super);
    function CustomLink(value, set) {
        var _this = _super.call(this, value) || this;
        _this.set = set;
        return _this;
    }
    CustomLink.prototype.set = function (x) { };
    return CustomLink;
}(Link));
export { CustomLink };
var CloneLink = /** @class */ (function (_super) {
    tslib_1.__extends(CloneLink, _super);
    function CloneLink(parent, set) {
        var _this = _super.call(this, parent.value) || this;
        _this.set = set;
        var error = parent.error;
        if (error)
            _this.error = error;
        return _this;
    }
    CloneLink.prototype.set = function (x) { };
    return CloneLink;
}(Link));
export { CloneLink };
var EqualsLink = /** @class */ (function (_super) {
    tslib_1.__extends(EqualsLink, _super);
    function EqualsLink(parent, truthyValue) {
        var _this = _super.call(this, parent.value === truthyValue) || this;
        _this.parent = parent;
        _this.truthyValue = truthyValue;
        return _this;
    }
    EqualsLink.prototype.set = function (x) {
        this.parent.set(x ? this.truthyValue : null);
    };
    return EqualsLink;
}(Link));
export { EqualsLink };
var EnabledLink = /** @class */ (function (_super) {
    tslib_1.__extends(EnabledLink, _super);
    function EnabledLink(parent, defaultValue) {
        var _this = _super.call(this, parent.value != null) || this;
        _this.parent = parent;
        _this.defaultValue = defaultValue;
        return _this;
    }
    EnabledLink.prototype.set = function (x) {
        this.parent.set(x ? this.defaultValue : null);
    };
    return EnabledLink;
}(Link));
export { EnabledLink };
var ContainsLink = /** @class */ (function (_super) {
    tslib_1.__extends(ContainsLink, _super);
    function ContainsLink(parent, element) {
        var _this = _super.call(this, parent.value.indexOf(element) >= 0) || this;
        _this.parent = parent;
        _this.element = element;
        return _this;
    }
    ContainsLink.prototype.set = function (x) {
        var _this = this;
        var next = Boolean(x);
        if (this.value !== next) {
            var arr = this.parent.value, nextValue = x ? arr.concat(this.element) : arr.filter(function (el) { return el !== _this.element; });
            this.parent.set(nextValue);
        }
    };
    return ContainsLink;
}(Link));
export { ContainsLink };
var defaultError = 'Invalid value';
/**
 * Link to array or object element enclosed in parent link.
 * Performs purely functional update of the parent, shallow copying its value on `set`.
 */
var LinkAt = /** @class */ (function (_super) {
    tslib_1.__extends(LinkAt, _super);
    function LinkAt(parent, key) {
        var _this = _super.call(this, parent.value[key]) || this;
        _this.parent = parent;
        _this.key = key;
        return _this;
    }
    LinkAt.prototype.remove = function () {
        this.parent.removeAt(this.key);
    };
    // Set new element value to parent array or object, performing purely functional update.
    LinkAt.prototype.set = function (x) {
        var _this = this;
        if (this.value !== x) {
            this.parent.update(function (value) {
                value[_this.key] = x;
                return value;
            });
        }
    };
    ;
    return LinkAt;
}(Link));
export { LinkAt };
//# sourceMappingURL=link.js.map