export = tempdir;
/**
 * Temporary folder
 *
 * @param {(uuid: string) => string} [transform=(p) => p] - Transform function to add prefixes or sufixes to the unique id
 * @returns {string} - Full real path to a temporary folder
 */
declare function tempdir(transform?: ((uuid: string) => string) | undefined): string;
//# sourceMappingURL=temp-dir.d.ts.map