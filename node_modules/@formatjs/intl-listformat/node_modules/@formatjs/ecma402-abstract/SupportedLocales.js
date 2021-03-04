"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedLocales = void 0;
var _262_1 = require("./262");
var GetOption_1 = require("./GetOption");
var LookupSupportedLocales_1 = require("./LookupSupportedLocales");
/**
 * https://tc39.es/ecma402/#sec-supportedlocales
 * @param availableLocales
 * @param requestedLocales
 * @param options
 */
function SupportedLocales(availableLocales, requestedLocales, options) {
    var matcher = 'best fit';
    if (options !== undefined) {
        options = _262_1.ToObject(options);
        matcher = GetOption_1.GetOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    }
    if (matcher === 'best fit') {
        return LookupSupportedLocales_1.LookupSupportedLocales(availableLocales, requestedLocales);
    }
    return LookupSupportedLocales_1.LookupSupportedLocales(availableLocales, requestedLocales);
}
exports.SupportedLocales = SupportedLocales;
