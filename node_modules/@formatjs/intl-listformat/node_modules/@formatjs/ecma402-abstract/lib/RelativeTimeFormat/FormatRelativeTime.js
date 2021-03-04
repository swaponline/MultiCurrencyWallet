import { PartitionRelativeTimePattern } from './PartitionRelativeTimePattern';
export function FormatRelativeTime(rtf, value, unit, implDetails) {
    var parts = PartitionRelativeTimePattern(rtf, value, unit, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
