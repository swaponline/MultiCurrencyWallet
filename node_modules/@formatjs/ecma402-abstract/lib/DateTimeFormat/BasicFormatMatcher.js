import { __assign } from "tslib";
import { invariant } from '../utils';
import { DATE_TIME_PROPS, additionPenalty, removalPenalty, longMorePenalty, shortMorePenalty, shortLessPenalty, longLessPenalty, } from './utils';
/**
 * https://tc39.es/ecma402/#sec-basicformatmatcher
 * @param options
 * @param formats
 */
export function BasicFormatMatcher(options, formats) {
    var bestScore = -Infinity;
    var bestFormat = formats[0];
    invariant(Array.isArray(formats), 'formats should be a list of things');
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
        var format = formats_1[_i];
        var score = 0;
        for (var _a = 0, DATE_TIME_PROPS_1 = DATE_TIME_PROPS; _a < DATE_TIME_PROPS_1.length; _a++) {
            var prop = DATE_TIME_PROPS_1[_a];
            var optionsProp = options[prop];
            var formatProp = format[prop];
            if (optionsProp === undefined && formatProp !== undefined) {
                score -= additionPenalty;
            }
            else if (optionsProp !== undefined && formatProp === undefined) {
                score -= removalPenalty;
            }
            else if (optionsProp !== formatProp) {
                var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];
                var optionsPropIndex = values.indexOf(optionsProp);
                var formatPropIndex = values.indexOf(formatProp);
                var delta = Math.max(-2, Math.min(formatPropIndex - optionsPropIndex, 2));
                if (delta === 2) {
                    score -= longMorePenalty;
                }
                else if (delta === 1) {
                    score -= shortMorePenalty;
                }
                else if (delta === -1) {
                    score -= shortLessPenalty;
                }
                else if (delta === -2) {
                    score -= longLessPenalty;
                }
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestFormat = format;
        }
    }
    return __assign({}, bestFormat);
}
