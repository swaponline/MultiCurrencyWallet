export = drain;
/**
 * Drains an (async) iterable discarding its' content and does not return
 * anything.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 * @returns {Promise<void>}
 */
declare function drain<T>(source: AsyncIterable<T> | Iterable<T>): Promise<void>;
//# sourceMappingURL=index.d.ts.map