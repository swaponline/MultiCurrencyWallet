"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimeRange = void 0;
var PartitionDateTimeRangePattern_1 = require("./PartitionDateTimeRangePattern");
function FormatDateTimeRange(dtf, x, y, implDetails) {
    var parts = PartitionDateTimeRangePattern_1.PartitionDateTimeRangePattern(dtf, x, y, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
exports.FormatDateTimeRange = FormatDateTimeRange;
