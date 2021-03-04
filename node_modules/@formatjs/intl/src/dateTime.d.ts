import { Formatters, IntlFormatters, CustomFormats, OnErrorFn } from './types';
import { DateTimeFormat } from '@formatjs/ecma402-abstract';
export declare function getFormatter({ locale, formats, onError, timeZone, }: {
    locale: string;
    timeZone?: string;
    formats: CustomFormats;
    onError: OnErrorFn;
}, type: 'date' | 'time', getDateTimeFormat: Formatters['getDateTimeFormat'], options?: Parameters<IntlFormatters['formatDate']>[1]): DateTimeFormat;
export declare function formatDate(config: {
    locale: string;
    timeZone?: string;
    formats: CustomFormats;
    onError: OnErrorFn;
}, getDateTimeFormat: Formatters['getDateTimeFormat'], ...[value, options]: Parameters<IntlFormatters['formatDate']>): string;
export declare function formatTime(config: {
    locale: string;
    timeZone?: string;
    formats: CustomFormats;
    onError: OnErrorFn;
}, getDateTimeFormat: Formatters['getDateTimeFormat'], ...[value, options]: Parameters<IntlFormatters['formatTime']>): string;
export declare function formatDateTimeRange(config: {
    locale: string;
    timeZone?: string;
    onError: OnErrorFn;
}, getDateTimeFormat: Formatters['getDateTimeFormat'], ...[from, to, options]: Parameters<IntlFormatters['formatDateTimeRange']>): string;
export declare function formatDateToParts(config: {
    locale: string;
    timeZone?: string;
    formats: CustomFormats;
    onError: OnErrorFn;
}, getDateTimeFormat: Formatters['getDateTimeFormat'], ...[value, options]: Parameters<IntlFormatters['formatDate']>): Intl.DateTimeFormatPart[];
export declare function formatTimeToParts(config: {
    locale: string;
    timeZone?: string;
    formats: CustomFormats;
    onError: OnErrorFn;
}, getDateTimeFormat: Formatters['getDateTimeFormat'], ...[value, options]: Parameters<IntlFormatters['formatTimeToParts']>): Intl.DateTimeFormatPart[];
//# sourceMappingURL=dateTime.d.ts.map