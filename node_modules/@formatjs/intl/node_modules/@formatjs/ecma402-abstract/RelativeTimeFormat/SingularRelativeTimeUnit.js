"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingularRelativeTimeUnit = void 0;
var utils_1 = require("../utils");
var _262_1 = require("../262");
/**
 * https://tc39.es/proposal-intl-relative-time/#sec-singularrelativetimeunit
 * @param unit
 */
function SingularRelativeTimeUnit(unit) {
    utils_1.invariant(_262_1.Type(unit) === 'String', 'unit must be a string');
    if (unit === 'seconds')
        return 'second';
    if (unit === 'minutes')
        return 'minute';
    if (unit === 'hours')
        return 'hour';
    if (unit === 'days')
        return 'day';
    if (unit === 'weeks')
        return 'week';
    if (unit === 'months')
        return 'month';
    if (unit === 'quarters')
        return 'quarter';
    if (unit === 'years')
        return 'year';
    if (unit !== 'second' &&
        unit !== 'minute' &&
        unit !== 'hour' &&
        unit !== 'day' &&
        unit !== 'week' &&
        unit !== 'month' &&
        unit !== 'quarter' &&
        unit !== 'year') {
        throw new RangeError('invalid unit');
    }
    return unit;
}
exports.SingularRelativeTimeUnit = SingularRelativeTimeUnit;
