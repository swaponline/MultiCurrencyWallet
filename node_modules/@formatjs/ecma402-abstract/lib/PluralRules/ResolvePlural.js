import { invariant } from '../utils';
import { Type } from '../262';
import { FormatNumericToString } from '../NumberFormat/FormatNumericToString';
import { GetOperands } from './GetOperands';
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-resolveplural
 * @param pl
 * @param n
 * @param PluralRuleSelect Has to pass in bc it's implementation-specific
 */
export function ResolvePlural(pl, n, _a) {
    var getInternalSlots = _a.getInternalSlots, PluralRuleSelect = _a.PluralRuleSelect;
    var internalSlots = getInternalSlots(pl);
    invariant(Type(internalSlots) === 'Object', 'pl has to be an object');
    invariant('initializedPluralRules' in internalSlots, 'pluralrules must be initialized');
    invariant(Type(n) === 'Number', 'n must be a number');
    if (!isFinite(n)) {
        return 'other';
    }
    var locale = internalSlots.locale, type = internalSlots.type;
    var res = FormatNumericToString(internalSlots, n);
    var s = res.formattedString;
    var operands = GetOperands(s);
    return PluralRuleSelect(locale, type, n, operands);
}
