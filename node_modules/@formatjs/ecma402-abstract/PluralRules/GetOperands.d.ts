export interface OperandsRecord {
    /**
     * Absolute value of the source number (integer and decimals)
     */
    Number: number;
    /**
     * Number of digits of `number`
     */
    IntegerDigits: number;
    /**
     * Number of visible fraction digits in [[Number]], with trailing zeroes.
     */
    NumberOfFractionDigits: number;
    /**
     * Number of visible fraction digits in [[Number]], without trailing zeroes.
     */
    NumberOfFractionDigitsWithoutTrailing: number;
    /**
     * Number of visible fractional digits in [[Number]], with trailing zeroes.
     */
    FractionDigits: number;
    /**
     * Number of visible fractional digits in [[Number]], without trailing zeroes.
     */
    FractionDigitsWithoutTrailing: number;
}
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-getoperands
 * @param s
 */
export declare function GetOperands(s: string): OperandsRecord;
//# sourceMappingURL=GetOperands.d.ts.map