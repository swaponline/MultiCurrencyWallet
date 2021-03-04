export = tempdir;
/**
 * Temporary folder
 *
 * @param {(uuid: string) => string} transform - Transform function to add prefixes or sufixes to the unique id
 * @returns {string} - Full real path to a temporary folder
 */
declare function tempdir(transform?: (uuid: string) => string): string;
//# sourceMappingURL=temp-dir.browser.d.ts.map