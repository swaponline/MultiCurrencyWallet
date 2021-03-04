import { UnpackedZoneData } from '../types/date-time';
export interface ToLocalTimeImplDetails {
    tzData: Record<string, UnpackedZoneData[]>;
}
/**
 * https://tc39.es/ecma402/#sec-tolocaltime
 * @param t
 * @param calendar
 * @param timeZone
 */
export declare function ToLocalTime(t: number, calendar: string, timeZone: string, { tzData }: ToLocalTimeImplDetails): {
    weekday: number;
    era: string;
    year: number;
    relatedYear: undefined;
    yearName: undefined;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    inDST: boolean;
    timeZoneOffset: number;
};
//# sourceMappingURL=ToLocalTime.d.ts.map