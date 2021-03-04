export = toString;
/**
 * Turns a `Uint8Array` into a string.
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {Uint8Array} array - The array to turn into a string
 * @param {BaseName | 'utf8' | 'utf-8' | 'ascii'} [encoding=utf8] - The encoding to use
 * @returns {string}
 */
declare function toString(array: Uint8Array, encoding?: "identity" | "base2" | "base8" | "base10" | "base16" | "base16upper" | "base32hex" | "base32hexupper" | "base32hexpad" | "base32hexpadupper" | "base32" | "base32upper" | "base32pad" | "base32padupper" | "base32z" | "base36" | "base36upper" | "base58btc" | "base58flickr" | "base64" | "base64pad" | "base64url" | "base64urlpad" | "utf8" | "utf-8" | "ascii" | undefined): string;
declare namespace toString {
    export { BaseName };
}
type BaseName = "identity" | "base2" | "base8" | "base10" | "base16" | "base16upper" | "base32hex" | "base32hexupper" | "base32hexpad" | "base32hexpadupper" | "base32" | "base32upper" | "base32pad" | "base32padupper" | "base32z" | "base36" | "base36upper" | "base58btc" | "base58flickr" | "base64" | "base64pad" | "base64url" | "base64urlpad";
//# sourceMappingURL=to-string.d.ts.map