"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortMorePenalty = exports.shortLessPenalty = exports.longMorePenalty = exports.longLessPenalty = exports.differentNumericTypePenalty = exports.additionPenalty = exports.removalPenalty = exports.DATE_TIME_PROPS = void 0;
exports.DATE_TIME_PROPS = [
    'weekday',
    'era',
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'timeZoneName',
];
exports.removalPenalty = 120;
exports.additionPenalty = 20;
exports.differentNumericTypePenalty = 15;
exports.longLessPenalty = 8;
exports.longMorePenalty = 6;
exports.shortLessPenalty = 6;
exports.shortMorePenalty = 3;
