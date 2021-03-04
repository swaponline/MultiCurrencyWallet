import { PartitionPattern } from '../PartitionPattern';
import { invariant } from '../utils';
export function MakePartsList(pattern, unit, parts) {
    var patternParts = PartitionPattern(pattern);
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
            invariant(patternPart.type === '0', "Malformed pattern " + pattern);
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
