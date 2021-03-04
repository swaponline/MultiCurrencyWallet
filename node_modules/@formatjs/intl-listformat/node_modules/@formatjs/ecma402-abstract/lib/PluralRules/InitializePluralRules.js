import { CanonicalizeLocaleList } from '../CanonicalizeLocaleList';
import { ToObject } from '../262';
import { GetOption } from '../GetOption';
import { SetNumberFormatDigitOptions } from '../NumberFormat/SetNumberFormatDigitOptions';
import { ResolveLocale } from '../ResolveLocale';
export function InitializePluralRules(pl, locales, options, _a) {
    var availableLocales = _a.availableLocales, relevantExtensionKeys = _a.relevantExtensionKeys, localeData = _a.localeData, getDefaultLocale = _a.getDefaultLocale, getInternalSlots = _a.getInternalSlots;
    var requestedLocales = CanonicalizeLocaleList(locales);
    var opt = Object.create(null);
    var opts = options === undefined ? Object.create(null) : ToObject(options);
    var internalSlots = getInternalSlots(pl);
    internalSlots.initializedPluralRules = true;
    var matcher = GetOption(opts, 'localeMatcher', 'string', ['best fit', 'lookup'], 'best fit');
    opt.localeMatcher = matcher;
    internalSlots.type = GetOption(opts, 'type', 'string', ['cardinal', 'ordinal'], 'cardinal');
    SetNumberFormatDigitOptions(internalSlots, opts, 0, 3, 'standard');
    var r = ResolveLocale(availableLocales, requestedLocales, opt, relevantExtensionKeys, localeData, getDefaultLocale);
    internalSlots.locale = r.locale;
    return pl;
}
