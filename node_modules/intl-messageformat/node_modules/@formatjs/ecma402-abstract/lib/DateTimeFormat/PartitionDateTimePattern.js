import { TimeClip } from '../262';
import { FormatDateTimePattern, } from './FormatDateTimePattern';
import { PartitionPattern } from '../PartitionPattern';
/**
 * https://tc39.es/ecma402/#sec-partitiondatetimepattern
 * @param dtf
 * @param x
 */
export function PartitionDateTimePattern(dtf, x, implDetails) {
    x = TimeClip(x);
    if (isNaN(x)) {
        throw new RangeError('invalid time');
    }
    /** IMPL START */
    var getInternalSlots = implDetails.getInternalSlots;
    var internalSlots = getInternalSlots(dtf);
    /** IMPL END */
    var pattern = internalSlots.pattern;
    return FormatDateTimePattern(dtf, PartitionPattern(pattern), x, implDetails);
}
