"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectType = function (value) {
    return Object.prototype.toString.call(value).slice(8, -1);
};
var isObjectOfType = function (type) { return function (value) {
    return exports.getObjectType(value) === type;
}; };
var isOfType = function (type) { return function (value) { return typeof value === type; }; };
var is = function (value) {
    switch (value) {
        case null:
            return "null" /* null */;
        case true:
        case false:
            return "boolean" /* boolean */;
        default:
    }
    switch (typeof value) {
        case 'undefined':
            return "undefined" /* undefined */;
        case 'string':
            return "string" /* string */;
        case 'number':
            return "number" /* number */;
        case 'bigint':
            return "bigint" /* bigint */;
        case 'symbol':
            return "symbol" /* symbol */;
        default:
    }
    if (is.array(value)) {
        return "Array" /* array */;
    }
    if (is.function(value)) {
        return "Function" /* function */;
    }
    var tagType = exports.getObjectType(value);
    /* istanbul ignore else */
    if (tagType) {
        return tagType;
    }
    /* istanbul ignore next */
    return "Object" /* object */;
};
is.array = Array.isArray;
is.arrayOf = function (target, predicate) {
    if (!is.array(target) && !is.function(predicate)) {
        return false;
    }
    return target.every(function (d) { return predicate(d); });
};
// tslint:disable-next-line:ban-types
is.asyncFunction = isObjectOfType("AsyncFunction" /* asyncFunction */);
is.boolean = function (value) {
    return value === true || value === false;
};
is.date = isObjectOfType("Date" /* date */);
is.defined = function (value) { return !is.undefined(value); };
is.domElement = function (value) {
    var DOM_PROPERTIES_TO_CHECK = [
        'innerHTML',
        'ownerDocument',
        'style',
        'attributes',
        'nodeValue',
    ];
    return (is.object(value) &&
        !is.plainObject(value) &&
        value.nodeType === 1 &&
        is.string(value.nodeName) &&
        DOM_PROPERTIES_TO_CHECK.every(function (property) { return property in value; }));
};
is.empty = function (value) {
    return ((is.string(value) && value.length === 0) ||
        (is.array(value) && value.length === 0) ||
        (is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0) ||
        (is.set(value) && value.size === 0) ||
        (is.map(value) && value.size === 0));
};
is.error = isObjectOfType("Error" /* error */);
// tslint:disable-next-line:ban-types
is.function = isObjectOfType("Function" /* function */);
is.generator = function (value) {
    return (is.iterable(value) &&
        is.function(value.next) &&
        is.function(value.throw));
};
is.generatorFunction = isObjectOfType("GeneratorFunction" /* generatorFunction */);
// tslint:disable-next-line:variable-name
is.instanceOf = function (instance, class_) {
    if (!instance || !class_) {
        return false;
    }
    return Object.getPrototypeOf(instance) === class_.prototype;
};
is.iterable = function (value) {
    return (!is.nullOrUndefined(value) && is.function(value[Symbol.iterator]));
};
is.map = isObjectOfType("Map" /* map */);
is.nan = function (value) {
    return Number.isNaN(value);
};
is.null = function (value) {
    return value === null;
};
is.nullOrUndefined = function (value) {
    return is.null(value) || is.undefined(value);
};
is.number = function (value) {
    return isOfType("number" /* number */)(value) && !is.nan(value);
};
is.numericString = function (value) {
    return is.string(value) && value.length > 0 && !Number.isNaN(Number(value));
};
is.object = function (value) {
    return !is.nullOrUndefined(value) && (is.function(value) || typeof value === 'object');
};
is.oneOf = function (target, value) {
    if (!is.array(target)) {
        return false;
    }
    return target.indexOf(value) > -1;
};
is.plainObject = function (value) {
    if (exports.getObjectType(value) !== 'Object') {
        return false;
    }
    var prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
};
is.promise = isObjectOfType("Promise" /* promise */);
is.propertyOf = function (target, key, predicate) {
    if (!is.object(target) || !key) {
        return false;
    }
    // @ts-ignore
    var value = target[key];
    if (is.function(predicate)) {
        return predicate(value);
    }
    return is.defined(value);
};
is.regexp = isObjectOfType("RegExp" /* regExp */);
is.set = isObjectOfType("Set" /* set */);
is.string = isOfType("string" /* string */);
is.symbol = isOfType("symbol" /* symbol */);
is.undefined = isOfType("undefined" /* undefined */);
is.weakMap = isObjectOfType("WeakMap" /* weakMap */);
is.weakSet = isObjectOfType("WeakSet" /* weakSet */);
exports.default = is;
//# sourceMappingURL=index.js.map