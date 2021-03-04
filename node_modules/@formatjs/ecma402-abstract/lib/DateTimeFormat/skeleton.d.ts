import { DateTimeFormatOptions, Formats, RangePatternPart } from '../types/date-time';
export declare function processDateTimePattern(pattern: string, result?: Pick<DateTimeFormatOptions, 'weekday' | 'era' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'timeZoneName'> & {
    hour12?: boolean;
}): [string, string];
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
export declare function parseDateTimeSkeleton(skeleton: string, rawPattern?: string, rangePatterns?: Record<string, string>, intervalFormatFallback?: string): Formats;
export declare function splitFallbackRangePattern(pattern: string): Array<RangePatternPart>;
export declare function splitRangePattern(pattern: string): Array<RangePatternPart>;
//# sourceMappingURL=skeleton.d.ts.map