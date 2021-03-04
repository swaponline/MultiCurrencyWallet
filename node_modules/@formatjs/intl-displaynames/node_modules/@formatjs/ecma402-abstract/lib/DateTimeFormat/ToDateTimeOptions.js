import { ToObject } from '../262';
/**
 * https://tc39.es/ecma402/#sec-todatetimeoptions
 * @param options
 * @param required
 * @param defaults
 */
export function ToDateTimeOptions(options, required, defaults) {
    if (options === undefined) {
        options = null;
    }
    else {
        options = ToObject(options);
    }
    options = Object.create(options);
    var needDefaults = true;
    if (required === 'date' || required === 'any') {
        for (var _i = 0, _a = ['weekday', 'year', 'month', 'day']; _i < _a.length; _i++) {
            var prop = _a[_i];
            var value = options[prop];
            if (value !== undefined) {
                needDefaults = false;
            }
        }
    }
    if (required === 'time' || required === 'any') {
        for (var _b = 0, _c = ['hour', 'minute', 'second']; _b < _c.length; _b++) {
            var prop = _c[_b];
            var value = options[prop];
            if (value !== undefined) {
                needDefaults = false;
            }
        }
    }
    if (options.dateStyle !== undefined || options.timeStyle !== undefined) {
        needDefaults = false;
    }
    if (required === 'date' && options.timeStyle) {
        throw new TypeError('Intl.DateTimeFormat date was required but timeStyle was included');
    }
    if (required === 'time' && options.dateStyle) {
        throw new TypeError('Intl.DateTimeFormat time was required but dateStyle was included');
    }
    if (needDefaults && (defaults === 'date' || defaults === 'all')) {
        for (var _d = 0, _e = ['year', 'month', 'day']; _d < _e.length; _d++) {
            var prop = _e[_d];
            options[prop] = 'numeric';
        }
    }
    if (needDefaults && (defaults === 'time' || defaults === 'all')) {
        for (var _f = 0, _g = ['hour', 'minute', 'second']; _f < _g.length; _f++) {
            var prop = _g[_f];
            options[prop] = 'numeric';
        }
    }
    return options;
}
