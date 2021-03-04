import { PartitionDateTimePattern } from './PartitionDateTimePattern';
import { IntlDateTimeFormatPart } from '../types/date-time';
/**
 * https://tc39.es/ecma402/#sec-formatdatetimetoparts
 *
 * @param dtf
 * @param x
 * @param implDetails
 */
export declare function FormatDateTimeToParts(dtf: Intl.DateTimeFormat, x: number, implDetails: Parameters<typeof PartitionDateTimePattern>[2]): IntlDateTimeFormatPart[];
//# sourceMappingURL=FormatDateTimeToParts.d.ts.map