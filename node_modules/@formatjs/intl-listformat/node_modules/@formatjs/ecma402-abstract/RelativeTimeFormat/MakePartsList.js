"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakePartsList = void 0;
var PartitionPattern_1 = require("../PartitionPattern");
var utils_1 = require("../utils");
function MakePartsList(pattern, unit, parts) {
    var patternParts = PartitionPattern_1.PartitionPattern(pattern);
    var result = [];
    for (var _i = 0, patternParts_1 = patternParts; _i < patternParts_1.length; _i++) {
        var patternPart = patternParts_1[_i];
        if (patternPart.type === 'literal') {
            result.push({
                type: 'literal',
                value: patternPart.value,
            });
        }
        else {
            utils_1.invariant(patternPart.type === '0', "Malformed pattern " + pattern);
            for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
                var part = parts_1[_a];
                result.push({
                    type: part.type,
                    value: part.value,
                    unit: unit,
                });
            }
        }
    }
    return result;
}
exports.MakePartsList = MakePartsList;
