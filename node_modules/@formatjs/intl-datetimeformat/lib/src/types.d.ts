import { LocaleData, DateTimeFormatLocaleInternalData, IntervalFormatsData } from '@formatjs/ecma402-abstract';
export interface PackedData {
    zones: string[];
    abbrvs: string;
    offsets: string;
}
export interface UnpackedData {
    zones: Record<string, ZoneData[]>;
    abbrvs: string[];
    /**
     * Offset in seconds, base 36
     */
    offsets: number[];
}
export declare type ZoneData = [
    number | string,
    number,
    number,
    number
];
export declare type RawDateTimeLocaleData = LocaleData<RawDateTimeLocaleInternalData>;
export declare type RawDateTimeLocaleInternalData = Omit<DateTimeFormatLocaleInternalData, 'dateFormat' | 'timeFormat' | 'dateTimeFormat' | 'formats' | 'intervalFormats'> & {
    formats: Record<string, Record<string, string>>;
    dateFormat: {
        full: string;
        long: string;
        medium: string;
        short: string;
    };
    timeFormat: {
        full: string;
        long: string;
        medium: string;
        short: string;
    };
    intervalFormats: IntervalFormatsData;
    dateTimeFormat: {
        full: string;
        long: string;
        medium: string;
        short: string;
    };
};
export declare type TimeZoneNameData = Record<string, {
    long?: [string, string];
    short?: [string, string];
}>;
//# sourceMappingURL=types.d.ts.map