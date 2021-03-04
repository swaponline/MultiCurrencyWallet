import { invariant } from '../utils';
export function DateTimeStyleFormat(dateStyle, timeStyle, dataLocaleData) {
    var dateFormat, timeFormat;
    if (timeStyle !== undefined) {
        invariant(timeStyle === 'full' ||
            timeStyle === 'long' ||
            timeStyle === 'medium' ||
            timeStyle === 'short', 'invalid timeStyle');
        timeFormat = dataLocaleData.timeFormat[timeStyle];
    }
    if (dateStyle !== undefined) {
        invariant(dateStyle === 'full' ||
            dateStyle === 'long' ||
            dateStyle === 'medium' ||
            dateStyle === 'short', 'invalid dateStyle');
        dateFormat = dataLocaleData.dateFormat[dateStyle];
    }
    if (dateStyle !== undefined && timeStyle !== undefined) {
        var format = {};
        for (var field in dateFormat) {
            if (field !== 'pattern') {
                // @ts-ignore
                format[field] = dateFormat[field];
            }
        }
        for (var field in timeFormat) {
            if (field !== 'pattern' && field !== 'pattern12') {
                // @ts-ignore
                format[field] = timeFormat[field];
            }
        }
        var connector = dataLocaleData.dateTimeFormat[dateStyle];
        var pattern = connector
            .replace('{0}', timeFormat.pattern)
            .replace('{1}', dateFormat.pattern);
        format.pattern = pattern;
        if ('pattern12' in timeFormat) {
            var pattern12 = connector
                .replace('{0}', timeFormat.pattern12)
                .replace('{1}', dateFormat.pattern);
            format.pattern12 = pattern12;
        }
        return format;
    }
    if (timeStyle !== undefined) {
        return timeFormat;
    }
    invariant(dateStyle !== undefined, 'dateStyle should not be undefined');
    return dateFormat;
}
