export = first;
/**
 * Returns the first result from an (async) iterable, unless empty, in which
 * case returns `undefined`.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 */
declare function first<T>(source: AsyncIterable<T> | Iterable<T>): Promise<T | undefined>;
//# sourceMappingURL=index.d.ts.map