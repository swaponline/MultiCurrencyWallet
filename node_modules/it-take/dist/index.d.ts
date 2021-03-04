export = take;
/**
 * Stop iteration after n items have been received.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 * @param {number} limit
 * @returns {AsyncIterable<T>}
 */
declare function take<T>(source: AsyncIterable<T> | Iterable<T>, limit: number): AsyncIterable<T>;
//# sourceMappingURL=index.d.ts.map