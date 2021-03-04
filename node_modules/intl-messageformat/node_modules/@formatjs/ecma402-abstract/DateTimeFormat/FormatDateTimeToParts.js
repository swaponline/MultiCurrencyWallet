"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimeToParts = void 0;
var PartitionDateTimePattern_1 = require("./PartitionDateTimePattern");
var _262_1 = require("../262");
/**
 * https://tc39.es/ecma402/#sec-formatdatetimetoparts
 *
 * @param dtf
 * @param x
 * @param implDetails
 */
function FormatDateTimeToParts(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern_1.PartitionDateTimePattern(dtf, x, implDetails);
    var result = _262_1.ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
        });
    }
    return result;
}
exports.FormatDateTimeToParts = FormatDateTimeToParts;
