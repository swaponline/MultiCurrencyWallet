"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTime = void 0;
var PartitionDateTimePattern_1 = require("./PartitionDateTimePattern");
/**
 * https://tc39.es/ecma402/#sec-formatdatetime
 * @param dtf DateTimeFormat
 * @param x
 */
function FormatDateTime(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern_1.PartitionDateTimePattern(dtf, x, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
exports.FormatDateTime = FormatDateTime;
