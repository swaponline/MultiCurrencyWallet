import { LDMLPluralRule, PluralRulesInternal } from '../types/plural-rules';
import { OperandsRecord } from './GetOperands';
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-resolveplural
 * @param pl
 * @param n
 * @param PluralRuleSelect Has to pass in bc it's implementation-specific
 */
export declare function ResolvePlural(pl: Intl.PluralRules, n: number, { getInternalSlots, PluralRuleSelect, }: {
    getInternalSlots(pl: Intl.PluralRules): PluralRulesInternal;
    PluralRuleSelect: (locale: string, type: 'cardinal' | 'ordinal', n: number, operands: OperandsRecord) => LDMLPluralRule;
}): LDMLPluralRule;
//# sourceMappingURL=ResolvePlural.d.ts.map