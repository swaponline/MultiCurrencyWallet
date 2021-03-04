"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deep_diff_1 = require("deep-diff");
// @ts-ignore
var nested_property_1 = require("nested-property");
function isPlainObj() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.every(function (d) {
        if (!d) {
            return false;
        }
        var prototype = Object.getPrototypeOf(d);
        return (Object.prototype.toString.call(d).slice(8, -1) === 'Object' &&
            (prototype === null || prototype === Object.getPrototypeOf({})));
    });
}
function isArray() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.every(Array.isArray);
}
function isNumber() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.every(function (d) { return typeof d === 'number'; });
}
function treeChanges(data, nextData) {
    if (!data || !nextData) {
        throw new Error('Missing required parameters');
    }
    return {
        changed: function (key) {
            var left = nested_property_1.get(data, key);
            var right = nested_property_1.get(nextData, key);
            if (isArray(left, right) || isPlainObj(left, right)) {
                return !!deep_diff_1.diff(left, right);
            }
            return left !== right;
        },
        changedFrom: function (key, previous, actual) {
            if (typeof key === 'undefined') {
                throw new Error('Key parameter is required');
            }
            var useActual = typeof previous !== 'undefined' && typeof actual !== 'undefined';
            var left = nested_property_1.get(data, key);
            var right = nested_property_1.get(nextData, key);
            var leftComparator = Array.isArray(previous)
                ? previous.indexOf(left) >= 0
                : left === previous;
            var rightComparator = Array.isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;
            return leftComparator && (useActual ? rightComparator : !useActual);
        },
        changedTo: function (key, actual) {
            if (typeof key === 'undefined') {
                throw new Error('Key parameter is required');
            }
            var left = nested_property_1.get(data, key);
            var right = nested_property_1.get(nextData, key);
            var leftComparator = Array.isArray(actual) ? actual.indexOf(left) < 0 : left !== actual;
            var rightComparator = Array.isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;
            return leftComparator && rightComparator;
        },
        increased: function (key) {
            if (typeof key === 'undefined') {
                throw new Error('Key parameter is required');
            }
            return (isNumber(nested_property_1.get(data, key), nested_property_1.get(nextData, key)) &&
                nested_property_1.get(data, key) < nested_property_1.get(nextData, key));
        },
        decreased: function (key) {
            if (typeof key === 'undefined') {
                throw new Error('Key parameter is required');
            }
            return (isNumber(nested_property_1.get(data, key), nested_property_1.get(nextData, key)) &&
                nested_property_1.get(data, key) > nested_property_1.get(nextData, key));
        },
    };
}
exports.default = treeChanges;
//# sourceMappingURL=index.js.map