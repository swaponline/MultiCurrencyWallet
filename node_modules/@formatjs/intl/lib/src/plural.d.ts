import { Formatters, IntlFormatters, OnErrorFn } from './types';
import { LDMLPluralRule } from '@formatjs/ecma402-abstract';
export declare function formatPlural({ locale, onError, }: {
    locale: string;
    onError: OnErrorFn;
}, getPluralRules: Formatters['getPluralRules'], value: Parameters<IntlFormatters['formatPlural']>[0], options?: Parameters<IntlFormatters['formatPlural']>[1]): LDMLPluralRule;
//# sourceMappingURL=plural.d.ts.map