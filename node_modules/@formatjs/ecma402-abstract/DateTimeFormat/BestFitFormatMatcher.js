"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestFitFormatMatcher = exports.bestFitFormatMatcherScore = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var utils_2 = require("./utils");
var skeleton_1 = require("./skeleton");
function isNumericType(t) {
    return t === 'numeric' || t === '2-digit';
}
/**
 * Credit: https://github.com/andyearnshaw/Intl.js/blob/0958dc1ad8153f1056653ea22b8208f0df289a4e/src/12.datetimeformat.js#L611
 * with some modifications
 * @param options
 * @param format
 */
function bestFitFormatMatcherScore(options, format) {
    var score = 0;
    if (options.hour12 && !format.hour12) {
        score -= utils_2.removalPenalty;
    }
    else if (!options.hour12 && format.hour12) {
        score -= utils_2.additionPenalty;
    }
    for (var _i = 0, DATE_TIME_PROPS_1 = utils_2.DATE_TIME_PROPS; _i < DATE_TIME_PROPS_1.length; _i++) {
        var prop = DATE_TIME_PROPS_1[_i];
        var optionsProp = options[prop];
        var formatProp = format[prop];
        if (optionsProp === undefined && formatProp !== undefined) {
            score -= utils_2.additionPenalty;
        }
        else if (optionsProp !== undefined && formatProp === undefined) {
            score -= utils_2.removalPenalty;
        }
        else if (optionsProp !== formatProp) {
            // extra penalty for numeric vs non-numeric
            if (isNumericType(optionsProp) !==
                isNumericType(formatProp)) {
                score -= utils_2.differentNumericTypePenalty;
            }
            else {
                var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];
                var optionsPropIndex = values.indexOf(optionsProp);
                var formatPropIndex = values.indexOf(formatProp);
                var delta = Math.max(-2, Math.min(formatPropIndex - optionsPropIndex, 2));
                if (delta === 2) {
                    score -= utils_2.longMorePenalty;
                }
                else if (delta === 1) {
                    score -= utils_2.shortMorePenalty;
                }
                else if (delta === -1) {
                    score -= utils_2.shortLessPenalty;
                }
                else if (delta === -2) {
                    score -= utils_2.longLessPenalty;
                }
            }
        }
    }
    return score;
}
exports.bestFitFormatMatcherScore = bestFitFormatMatcherScore;
/**
 * https://tc39.es/ecma402/#sec-bestfitformatmatcher
 * Just alias to basic for now
 * @param options
 * @param formats
 * @param implDetails Implementation details
 */
function BestFitFormatMatcher(options, formats) {
    var bestScore = -Infinity;
    var bestFormat = formats[0];
    utils_1.invariant(Array.isArray(formats), 'formats should be a list of things');
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
        var format = formats_1[_i];
        var score = bestFitFormatMatcherScore(options, format);
        if (score > bestScore) {
            bestScore = score;
            bestFormat = format;
        }
    }
    var skeletonFormat = tslib_1.__assign({}, bestFormat);
    var patternFormat = { rawPattern: bestFormat.rawPattern };
    skeleton_1.processDateTimePattern(bestFormat.rawPattern, patternFormat);
    // Kinda following https://github.com/unicode-org/icu/blob/dd50e38f459d84e9bf1b0c618be8483d318458ad/icu4j/main/classes/core/src/com/ibm/icu/text/DateTimePatternGenerator.java
    // Method adjustFieldTypes
    for (var prop in skeletonFormat) {
        var skeletonValue = skeletonFormat[prop];
        var patternValue = patternFormat[prop];
        var requestedValue = options[prop];
        // Don't mess with minute/second or we can get in the situation of
        // 7:0:0 which is weird
        if (prop === 'minute' || prop === 'second') {
            continue;
        }
        // Nothing to do here
        if (!requestedValue) {
            continue;
        }
        // https://unicode.org/reports/tr35/tr35-dates.html#Matching_Skeletons
        // Looks like we should not convert numeric to alphabetic but the other way
        // around is ok
        if (isNumericType(patternValue) &&
            !isNumericType(requestedValue)) {
            continue;
        }
        if (skeletonValue === requestedValue) {
            continue;
        }
        patternFormat[prop] = requestedValue;
    }
    // Copy those over
    patternFormat.pattern = skeletonFormat.pattern;
    patternFormat.pattern12 = skeletonFormat.pattern12;
    patternFormat.skeleton = skeletonFormat.skeleton;
    patternFormat.rangePatterns = skeletonFormat.rangePatterns;
    patternFormat.rangePatterns12 = skeletonFormat.rangePatterns12;
    return patternFormat;
}
exports.BestFitFormatMatcher = BestFitFormatMatcher;
