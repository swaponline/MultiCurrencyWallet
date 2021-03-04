"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionDateTimeRangePattern = void 0;
var _262_1 = require("../262");
var ToLocalTime_1 = require("./ToLocalTime");
var FormatDateTimePattern_1 = require("./FormatDateTimePattern");
var PartitionPattern_1 = require("../PartitionPattern");
var TABLE_2_FIELDS = [
    'era',
    'year',
    'month',
    'day',
    'ampm',
    'hour',
    'minute',
    'second',
];
function PartitionDateTimeRangePattern(dtf, x, y, implDetails) {
    x = _262_1.TimeClip(x);
    if (isNaN(x)) {
        throw new RangeError('Invalid start time');
    }
    y = _262_1.TimeClip(y);
    if (isNaN(y)) {
        throw new RangeError('Invalid end time');
    }
    /** IMPL START */
    var getInternalSlots = implDetails.getInternalSlots, tzData = implDetails.tzData;
    var internalSlots = getInternalSlots(dtf);
    /** IMPL END */
    var tm1 = ToLocalTime_1.ToLocalTime(x, 
    // @ts-ignore
    internalSlots.calendar, internalSlots.timeZone, { tzData: tzData });
    var tm2 = ToLocalTime_1.ToLocalTime(y, 
    // @ts-ignore
    internalSlots.calendar, internalSlots.timeZone, { tzData: tzData });
    var pattern = internalSlots.pattern, rangePatterns = internalSlots.rangePatterns;
    var rangePattern;
    var dateFieldsPracticallyEqual = true;
    var patternContainsLargerDateField = false;
    for (var _i = 0, TABLE_2_FIELDS_1 = TABLE_2_FIELDS; _i < TABLE_2_FIELDS_1.length; _i++) {
        var fieldName = TABLE_2_FIELDS_1[_i];
        if (dateFieldsPracticallyEqual && !patternContainsLargerDateField) {
            if (fieldName === 'ampm') {
                var v1 = tm1.hour;
                var v2 = tm2.hour;
                var rp = rangePatterns.ampm;
                if ((v1 > 11 && v2 < 11) || (v1 < 11 && v2 > 11)) {
                    dateFieldsPracticallyEqual = false;
                }
                if (rangePattern !== undefined && rp === undefined) {
                    patternContainsLargerDateField = true;
                }
                rangePattern = rp;
            }
            else {
                var v1 = tm1[fieldName];
                var v2 = tm2[fieldName];
                var rp = rangePatterns[fieldName];
                if (!_262_1.SameValue(v1, v2)) {
                    dateFieldsPracticallyEqual = false;
                }
                if (rangePattern !== undefined && rp === undefined) {
                    patternContainsLargerDateField = true;
                }
                rangePattern = rp;
            }
        }
    }
    if (dateFieldsPracticallyEqual) {
        var result_2 = FormatDateTimePattern_1.FormatDateTimePattern(dtf, PartitionPattern_1.PartitionPattern(pattern), x, implDetails);
        for (var _a = 0, result_1 = result_2; _a < result_1.length; _a++) {
            var r = result_1[_a];
            r.source = "shared" /* shared */;
        }
        return result_2;
    }
    var result = [];
    if (rangePattern === undefined) {
        rangePattern = rangePatterns.default;
    }
    for (var _b = 0, _c = rangePattern.patternParts; _b < _c.length; _b++) {
        var rangePatternPart = _c[_b];
        var source = rangePatternPart.source, pattern_1 = rangePatternPart.pattern;
        var z = void 0;
        if (source === "startRange" /* startRange */ ||
            source === "shared" /* shared */) {
            z = x;
        }
        else {
            z = y;
        }
        var patternParts = PartitionPattern_1.PartitionPattern(pattern_1);
        var partResult = FormatDateTimePattern_1.FormatDateTimePattern(dtf, patternParts, z, implDetails);
        for (var _d = 0, partResult_1 = partResult; _d < partResult_1.length; _d++) {
            var r = partResult_1[_d];
            r.source = source;
        }
        result = result.concat(partResult);
    }
    return result;
}
exports.PartitionDateTimeRangePattern = PartitionDateTimeRangePattern;
