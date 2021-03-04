import { invariant } from '../utils';
import { SingularRelativeTimeUnit } from './SingularRelativeTimeUnit';
import { MakePartsList } from './MakePartsList';
import { ToString, Type, SameValue } from '../262';
export function PartitionRelativeTimePattern(rtf, value, unit, _a) {
    var getInternalSlots = _a.getInternalSlots;
    invariant(Type(value) === 'Number', "value must be number, instead got " + typeof value, TypeError);
    invariant(Type(unit) === 'String', "unit must be number, instead got " + typeof value, TypeError);
    if (isNaN(value) || !isFinite(value)) {
        throw new RangeError("Invalid value " + value);
    }
    var resolvedUnit = SingularRelativeTimeUnit(unit);
    var _b = getInternalSlots(rtf), fields = _b.fields, style = _b.style, numeric = _b.numeric, pluralRules = _b.pluralRules, numberFormat = _b.numberFormat;
    var entry = resolvedUnit;
    if (style === 'short') {
        entry = resolvedUnit + "-short";
    }
    else if (style === 'narrow') {
        entry = resolvedUnit + "-narrow";
    }
    if (!(entry in fields)) {
        entry = resolvedUnit;
    }
    var patterns = fields[entry];
    if (numeric === 'auto') {
        if (ToString(value) in patterns) {
            return [
                {
                    type: 'literal',
                    value: patterns[ToString(value)],
                },
            ];
        }
    }
    var tl = 'future';
    if (SameValue(value, -0) || value < 0) {
        tl = 'past';
    }
    var po = patterns[tl];
    var fv = typeof numberFormat.formatToParts === 'function'
        ? numberFormat.formatToParts(Math.abs(value))
        : // TODO: If formatToParts is not supported, we assume the whole formatted
            // number is a part
            [
                {
                    type: 'literal',
                    value: numberFormat.format(Math.abs(value)),
                    unit: unit,
                },
            ];
    var pr = pluralRules.select(value);
    var pattern = po[pr];
    return MakePartsList(pattern, resolvedUnit, fv);
}
