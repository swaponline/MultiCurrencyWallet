import { IntlDateTimeFormatInternal, DateTimeFormatLocaleInternalData, IntlDateTimeFormatPart } from '../types/date-time';
import { ToLocalTimeImplDetails } from './ToLocalTime';
export interface FormatDateTimePatternImplDetails {
    getInternalSlots(dtf: Intl.DateTimeFormat): IntlDateTimeFormatInternal;
    localeData: Record<string, DateTimeFormatLocaleInternalData>;
    getDefaultTimeZone(): string;
}
/**
 * https://tc39.es/ecma402/#sec-partitiondatetimepattern
 * @param dtf
 * @param x
 */
export declare function FormatDateTimePattern(dtf: Intl.DateTimeFormat, patternParts: IntlDateTimeFormatPart[], x: number, { getInternalSlots, localeData, getDefaultTimeZone, tzData, }: FormatDateTimePatternImplDetails & ToLocalTimeImplDetails): IntlDateTimeFormatPart[];
//# sourceMappingURL=FormatDateTimePattern.d.ts.map