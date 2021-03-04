"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionRelativeTimePattern = void 0;
var utils_1 = require("../utils");
var SingularRelativeTimeUnit_1 = require("./SingularRelativeTimeUnit");
var MakePartsList_1 = require("./MakePartsList");
var _262_1 = require("../262");
function PartitionRelativeTimePattern(rtf, value, unit, _a) {
    var getInternalSlots = _a.getInternalSlots;
    utils_1.invariant(_262_1.Type(value) === 'Number', "value must be number, instead got " + typeof value, TypeError);
    utils_1.invariant(_262_1.Type(unit) === 'String', "unit must be number, instead got " + typeof value, TypeError);
    if (isNaN(value) || !isFinite(value)) {
        throw new RangeError("Invalid value " + value);
    }
    var resolvedUnit = SingularRelativeTimeUnit_1.SingularRelativeTimeUnit(unit);
    var _b = getInternalSlots(rtf), fields = _b.fields, style = _b.style, numeric = _b.numeric, pluralRules = _b.pluralRules, numberFormat = _b.numberFormat;
    var entry = resolvedUnit;
    if (style === 'short') {
        entry = resolvedUnit + "-short";
    }
    else if (style === 'narrow') {
        entry = resolvedUnit + "-narrow";
    }
    if (!(entry in fields)) {
        entry = resolvedUnit;
    }
    var patterns = fields[entry];
    if (numeric === 'auto') {
        if (_262_1.ToString(value) in patterns) {
            return [
                {
                    type: 'literal',
                    value: patterns[_262_1.ToString(value)],
                },
            ];
        }
    }
    var tl = 'future';
    if (_262_1.SameValue(value, -0) || value < 0) {
        tl = 'past';
    }
    var po = patterns[tl];
    var fv = typeof numberFormat.formatToParts === 'function'
        ? numberFormat.formatToParts(Math.abs(value))
        : // TODO: If formatToParts is not supported, we assume the whole formatted
            // number is a part
            [
                {
                    type: 'literal',
                    value: numberFormat.format(Math.abs(value)),
                    unit: unit,
                },
            ];
    var pr = pluralRules.select(value);
    var pattern = po[pr];
    return MakePartsList_1.MakePartsList(pattern, resolvedUnit, fv);
}
exports.PartitionRelativeTimePattern = PartitionRelativeTimePattern;
