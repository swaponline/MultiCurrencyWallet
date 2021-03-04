import { DateTimeFormatOptions, Formats } from '../types/date-time';
/**
 * Credit: https://github.com/andyearnshaw/Intl.js/blob/0958dc1ad8153f1056653ea22b8208f0df289a4e/src/12.datetimeformat.js#L611
 * with some modifications
 * @param options
 * @param format
 */
export declare function bestFitFormatMatcherScore(options: DateTimeFormatOptions, format: Formats): number;
/**
 * https://tc39.es/ecma402/#sec-bestfitformatmatcher
 * Just alias to basic for now
 * @param options
 * @param formats
 * @param implDetails Implementation details
 */
export declare function BestFitFormatMatcher(options: DateTimeFormatOptions, formats: Formats[]): Formats;
//# sourceMappingURL=BestFitFormatMatcher.d.ts.map