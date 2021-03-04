export = Base;
/** @typedef {import('./types').CodecFactory} CodecFactory */
/** @typedef {import("./types").BaseName} BaseName */
/** @typedef {import("./types").BaseCode} BaseCode */
/**
 * Class to encode/decode in the supported Bases
 *
 */
declare class Base {
    /**
     * @param {BaseName} name
     * @param {BaseCode} code
     * @param {CodecFactory} factory
     * @param {string} alphabet
     */
    constructor(name: BaseName, code: BaseCode, factory: CodecFactory, alphabet: string);
    name: import("./types").BaseName;
    code: import("./types").BaseCode;
    codeBuf: Uint8Array;
    alphabet: string;
    codec: import("./types").Codec;
    /**
     * @param {Uint8Array} buf
     * @returns {string}
     */
    encode(buf: Uint8Array): string;
    /**
     * @param {string} string
     * @returns {Uint8Array}
     */
    decode(string: string): Uint8Array;
}
declare namespace Base {
    export { CodecFactory, BaseName, BaseCode };
}
type BaseName = "identity" | "base2" | "base8" | "base10" | "base16" | "base16upper" | "base32hex" | "base32hexupper" | "base32hexpad" | "base32hexpadupper" | "base32" | "base32upper" | "base32pad" | "base32padupper" | "base32z" | "base36" | "base36upper" | "base58btc" | "base58flickr" | "base64" | "base64pad" | "base64url" | "base64urlpad";
type BaseCode = "\0" | "0" | "7" | "9" | "f" | "F" | "v" | "V" | "t" | "T" | "b" | "B" | "c" | "C" | "h" | "k" | "K" | "z" | "Z" | "m" | "M" | "u" | "U";
type CodecFactory = import("./types").CodecFactory;
//# sourceMappingURL=base.d.ts.map