import { __assign } from "tslib";
/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
// trim patterns after transformations
var expPatternTrimmer = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
function matchSkeletonPattern(match, result) {
    var len = match.length;
    switch (match[0]) {
        // Era
        case 'G':
            result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
            return '{era}';
        // Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            result.year = len === 2 ? '2-digit' : 'numeric';
            return '{year}';
        // Quarter
        case 'q':
        case 'Q':
            throw new RangeError('`w/Q` (quarter) patterns are not supported');
        // Month
        case 'M':
        case 'L':
            result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
            return '{month}';
        // Week
        case 'w':
        case 'W':
            throw new RangeError('`w/W` (week of year) patterns are not supported');
        case 'd':
            result.day = ['numeric', '2-digit'][len - 1];
            return '{day}';
        case 'D':
        case 'F':
        case 'g':
            result.day = 'numeric';
            return '{day}';
        // Weekday
        case 'E':
            result.weekday = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
            return '{weekday}';
        case 'e':
            result.weekday = [
                'numeric',
                '2-digit',
                'short',
                'long',
                'narrow',
                'short',
            ][len - 1];
            return '{weekday}';
        case 'c':
            result.weekday = [
                'numeric',
                undefined,
                'short',
                'long',
                'narrow',
                'short',
            ][len - 1];
            return '{weekday}';
        // Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B': // flexible day periods
            result.hour12 = true;
            return '{ampm}';
        // Hour
        case 'h':
            result.hour = ['numeric', '2-digit'][len - 1];
            result.hour12 = true;
            return '{hour}';
        case 'H':
            result.hour = ['numeric', '2-digit'][len - 1];
            return '{hour}';
        case 'K':
            result.hour = ['numeric', '2-digit'][len - 1];
            result.hour12 = true;
            return '{hour}';
        case 'k':
            result.hour = ['numeric', '2-digit'][len - 1];
            return '{hour}';
        case 'j':
        case 'J':
        case 'C':
            throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
        // Minute
        case 'm':
            result.minute = ['numeric', '2-digit'][len - 1];
            return '{minute}';
        // Second
        case 's':
            result.second = ['numeric', '2-digit'][len - 1];
            return '{second}';
        case 'S':
        case 'A':
            result.second = 'numeric';
            return '{second}';
        // Zone
        case 'z': // 1..3, 4: specific non-location format
        case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
        case 'O': // 1, 4: miliseconds in day short, long
        case 'v': // 1, 4: generic non-location format
        case 'V': // 1, 2, 3, 4: time zone ID or city
        case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
        case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
            result.timeZoneName = len < 4 ? 'short' : 'long';
            return '{timeZoneName}';
    }
    return '';
}
function skeletonTokenToTable2(c) {
    switch (c) {
        // Era
        case 'G':
            return 'era';
        // Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            return 'year';
        // Month
        case 'M':
        case 'L':
            return 'month';
        // Day
        case 'd':
        case 'D':
        case 'F':
        case 'g':
            return 'day';
        // Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B': // flexible day periods
            return 'ampm';
        // Hour
        case 'h':
        case 'H':
        case 'K':
        case 'k':
            return 'hour';
        // Minute
        case 'm':
            return 'minute';
        // Second
        case 's':
        case 'S':
        case 'A':
            return 'second';
        default:
            throw new RangeError('Invalid range pattern token');
    }
}
export function processDateTimePattern(pattern, result) {
    var literals = [];
    // Use skeleton to populate result, but use mapped pattern to populate pattern
    var pattern12 = pattern
        // Double apostrophe
        .replace(/'{2}/g, '{apostrophe}')
        // Apostrophe-escaped
        .replace(/'(.*?)'/g, function (_, literal) {
        literals.push(literal);
        return "$$" + (literals.length - 1) + "$$";
    })
        .replace(DATE_TIME_REGEX, function (m) { return matchSkeletonPattern(m, result || {}); });
    //Restore literals
    if (literals.length) {
        pattern12 = pattern12
            .replace(/\$\$(\d+)\$\$/g, function (_, i) {
            return literals[+i];
        })
            .replace(/\{apostrophe\}/g, "'");
    }
    // Handle apostrophe-escaped things
    return [
        pattern12
            .replace(/([\s\uFEFF\xA0])\{ampm\}([\s\uFEFF\xA0])/, '$1')
            .replace('{ampm}', '')
            .replace(expPatternTrimmer, ''),
        pattern12,
    ];
}
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
export function parseDateTimeSkeleton(skeleton, rawPattern, rangePatterns, intervalFormatFallback) {
    if (rawPattern === void 0) { rawPattern = skeleton; }
    var result = {
        pattern: '',
        pattern12: '',
        skeleton: skeleton,
        rawPattern: rawPattern,
        rangePatterns: {},
        rangePatterns12: {},
    };
    if (rangePatterns) {
        for (var k in rangePatterns) {
            var key = skeletonTokenToTable2(k);
            var rawPattern_1 = rangePatterns[k];
            var intervalResult = {
                patternParts: [],
            };
            var _a = processDateTimePattern(rawPattern_1, intervalResult), pattern_1 = _a[0], pattern12_1 = _a[1];
            result.rangePatterns[key] = __assign(__assign({}, intervalResult), { patternParts: splitRangePattern(pattern_1) });
            result.rangePatterns12[key] = __assign(__assign({}, intervalResult), { patternParts: splitRangePattern(pattern12_1) });
        }
    }
    else if (intervalFormatFallback) {
        var patternParts = splitFallbackRangePattern(intervalFormatFallback);
        result.rangePatterns.default = {
            patternParts: patternParts,
        };
        result.rangePatterns12.default = {
            patternParts: patternParts,
        };
    }
    // Process skeleton
    skeleton.replace(DATE_TIME_REGEX, function (m) { return matchSkeletonPattern(m, result); });
    var _b = processDateTimePattern(rawPattern), pattern = _b[0], pattern12 = _b[1];
    result.pattern = pattern;
    result.pattern12 = pattern12;
    return result;
}
export function splitFallbackRangePattern(pattern) {
    var parts = pattern.split(/(\{[0|1]\})/g).filter(Boolean);
    return parts.map(function (pattern) {
        switch (pattern) {
            case '{0}':
                return {
                    source: "startRange" /* startRange */,
                    pattern: pattern,
                };
            case '{1}':
                return {
                    source: "endRange" /* endRange */,
                    pattern: pattern,
                };
            default:
                return {
                    source: "shared" /* shared */,
                    pattern: pattern,
                };
        }
    });
}
export function splitRangePattern(pattern) {
    var PART_REGEX = /\{(.*?)\}/g;
    // Map of part and index within the string
    var parts = {};
    var match;
    var splitIndex = 0;
    while ((match = PART_REGEX.exec(pattern))) {
        if (!(match[0] in parts)) {
            parts[match[0]] = match.index;
        }
        else {
            splitIndex = match.index;
            break;
        }
    }
    if (!splitIndex) {
        return [
            {
                source: "startRange" /* startRange */,
                pattern: pattern,
            },
        ];
    }
    return [
        {
            source: "startRange" /* startRange */,
            pattern: pattern.slice(0, splitIndex),
        },
        {
            source: "endRange" /* endRange */,
            pattern: pattern.slice(splitIndex),
        },
    ];
}
