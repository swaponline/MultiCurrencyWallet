"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatRelativeTimeToParts = void 0;
var PartitionRelativeTimePattern_1 = require("./PartitionRelativeTimePattern");
var _262_1 = require("../262");
function FormatRelativeTimeToParts(rtf, value, unit, implDetails) {
    var parts = PartitionRelativeTimePattern_1.PartitionRelativeTimePattern(rtf, value, unit, implDetails);
    var result = _262_1.ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var o = {
            type: part.type,
            value: part.value,
        };
        if ('unit' in part) {
            o.unit = part.unit;
        }
        result.push(o);
    }
    return result;
}
exports.FormatRelativeTimeToParts = FormatRelativeTimeToParts;
