"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionDateTimePattern = void 0;
var _262_1 = require("../262");
var FormatDateTimePattern_1 = require("./FormatDateTimePattern");
var PartitionPattern_1 = require("../PartitionPattern");
/**
 * https://tc39.es/ecma402/#sec-partitiondatetimepattern
 * @param dtf
 * @param x
 */
function PartitionDateTimePattern(dtf, x, implDetails) {
    x = _262_1.TimeClip(x);
    if (isNaN(x)) {
        throw new RangeError('invalid time');
    }
    /** IMPL START */
    var getInternalSlots = implDetails.getInternalSlots;
    var internalSlots = getInternalSlots(dtf);
    /** IMPL END */
    var pattern = internalSlots.pattern;
    return FormatDateTimePattern_1.FormatDateTimePattern(dtf, PartitionPattern_1.PartitionPattern(pattern), x, implDetails);
}
exports.PartitionDateTimePattern = PartitionDateTimePattern;
