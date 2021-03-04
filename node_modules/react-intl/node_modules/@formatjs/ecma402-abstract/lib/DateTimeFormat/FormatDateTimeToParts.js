import { PartitionDateTimePattern } from './PartitionDateTimePattern';
import { ArrayCreate } from '../262';
/**
 * https://tc39.es/ecma402/#sec-formatdatetimetoparts
 *
 * @param dtf
 * @param x
 * @param implDetails
 */
export function FormatDateTimeToParts(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern(dtf, x, implDetails);
    var result = ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
        });
    }
    return result;
}
