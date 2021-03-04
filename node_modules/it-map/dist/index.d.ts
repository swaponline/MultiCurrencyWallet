export = map;
/**
 * Takes an (async) iterable and returns one with each item mapped by the passed
 * function.
 *
 * @template I,O
 * @param {AsyncIterable<I>|Iterable<I>} source
 * @param {function(I):O|Promise<O>} func
 * @returns {AsyncIterable<O>}
 */
declare function map<I, O>(source: AsyncIterable<I> | Iterable<I>, func: (arg0: I) => O | Promise<O>): AsyncIterable<O>;
//# sourceMappingURL=index.d.ts.map