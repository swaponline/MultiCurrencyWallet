"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializePluralRules = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var _262_1 = require("../262");
var GetOption_1 = require("../GetOption");
var SetNumberFormatDigitOptions_1 = require("../NumberFormat/SetNumberFormatDigitOptions");
var ResolveLocale_1 = require("../ResolveLocale");
function InitializePluralRules(pl, locales, options, _a) {
    var availableLocales = _a.availableLocales, relevantExtensionKeys = _a.relevantExtensionKeys, localeData = _a.localeData, getDefaultLocale = _a.getDefaultLocale, getInternalSlots = _a.getInternalSlots;
    var requestedLocales = CanonicalizeLocaleList_1.CanonicalizeLocaleList(locales);
    var opt = Object.create(null);
    var opts = options === undefined ? Object.create(null) : _262_1.ToObject(options);
    var internalSlots = getInternalSlots(pl);
    internalSlots.initializedPluralRules = true;
    var matcher = GetOption_1.GetOption(opts, 'localeMatcher', 'string', ['best fit', 'lookup'], 'best fit');
    opt.localeMatcher = matcher;
    internalSlots.type = GetOption_1.GetOption(opts, 'type', 'string', ['cardinal', 'ordinal'], 'cardinal');
    SetNumberFormatDigitOptions_1.SetNumberFormatDigitOptions(internalSlots, opts, 0, 3, 'standard');
    var r = ResolveLocale_1.ResolveLocale(availableLocales, requestedLocales, opt, relevantExtensionKeys, localeData, getDefaultLocale);
    internalSlots.locale = r.locale;
    return pl;
}
exports.InitializePluralRules = InitializePluralRules;
