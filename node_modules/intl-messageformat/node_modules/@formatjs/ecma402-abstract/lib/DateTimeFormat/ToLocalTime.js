import { invariant } from '../utils';
import { Type, YearFromTime, WeekDay, MonthFromTime, DateFromTime, HourFromTime, MinFromTime, SecFromTime, } from '../262';
function getApplicableZoneData(t, timeZone, tzData) {
    var _a;
    var zoneData = tzData[timeZone];
    // We don't have data for this so just say it's UTC
    if (!zoneData) {
        return [0, false];
    }
    var i = 0;
    var offset = 0;
    var dst = false;
    for (; i <= zoneData.length; i++) {
        if (i === zoneData.length || zoneData[i][0] * 1e3 > t) {
            _a = zoneData[i - 1], offset = _a[2], dst = _a[3];
            break;
        }
    }
    return [offset * 1e3, dst];
}
/**
 * https://tc39.es/ecma402/#sec-tolocaltime
 * @param t
 * @param calendar
 * @param timeZone
 */
export function ToLocalTime(t, calendar, timeZone, _a) {
    var tzData = _a.tzData;
    invariant(Type(t) === 'Number', 'invalid time');
    invariant(calendar === 'gregory', 'We only support Gregory calendar right now');
    var _b = getApplicableZoneData(t, timeZone, tzData), timeZoneOffset = _b[0], inDST = _b[1];
    var tz = t + timeZoneOffset;
    var year = YearFromTime(tz);
    return {
        weekday: WeekDay(tz),
        era: year < 0 ? 'BC' : 'AD',
        year: year,
        relatedYear: undefined,
        yearName: undefined,
        month: MonthFromTime(tz),
        day: DateFromTime(tz),
        hour: HourFromTime(tz),
        minute: MinFromTime(tz),
        second: SecFromTime(tz),
        inDST: inDST,
        // IMPORTANT: Not in spec
        timeZoneOffset: timeZoneOffset,
    };
}
