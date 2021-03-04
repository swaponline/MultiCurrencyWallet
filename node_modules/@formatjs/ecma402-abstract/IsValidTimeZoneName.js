"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidTimeZoneName = void 0;
/**
 * https://tc39.es/ecma402/#sec-isvalidtimezonename
 * @param tz
 * @param implDetails implementation details
 */
function IsValidTimeZoneName(tz, _a) {
    var tzData = _a.tzData, uppercaseLinks = _a.uppercaseLinks;
    var uppercasedTz = tz.toUpperCase();
    var zoneNames = new Set(Object.keys(tzData).map(function (z) { return z.toUpperCase(); }));
    return zoneNames.has(uppercasedTz) || uppercasedTz in uppercaseLinks;
}
exports.IsValidTimeZoneName = IsValidTimeZoneName;
