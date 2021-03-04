export = filter;
/**
 * Filters the passed (async) iterable by using the filter function
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 * @param {function(T):boolean|Promise<boolean>} fn
 */
declare function filter<T>(source: AsyncIterable<T> | Iterable<T>, fn: (arg0: T) => boolean | Promise<boolean>): AsyncGenerator<T, void, unknown>;
//# sourceMappingURL=index.d.ts.map