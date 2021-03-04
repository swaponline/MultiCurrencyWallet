export = urlSource;
/**
 *
 * @param {string} url
 * @param {import("../types").HTTPOptions} [options]
 * @returns {{ path: string; content?: AsyncIterable<Uint8Array> }}
 */
declare function urlSource(url: string, options?: import("../types").HTTPOptions | undefined): {
    path: string;
    content?: AsyncIterable<Uint8Array>;
};
//# sourceMappingURL=url-source.d.ts.map