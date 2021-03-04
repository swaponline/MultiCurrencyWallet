import { PartitionRelativeTimePattern } from './PartitionRelativeTimePattern';
import { ArrayCreate } from '../262';
export function FormatRelativeTimeToParts(rtf, value, unit, implDetails) {
    var parts = PartitionRelativeTimePattern(rtf, value, unit, implDetails);
    var result = ArrayCreate(0);
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
