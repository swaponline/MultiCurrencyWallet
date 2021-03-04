import { PartitionDateTimePattern } from './PartitionDateTimePattern';
/**
 * https://tc39.es/ecma402/#sec-formatdatetime
 * @param dtf DateTimeFormat
 * @param x
 */
export function FormatDateTime(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern(dtf, x, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
