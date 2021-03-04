/// <reference types="node" />
interface Encode {
    (num: number, buffer?: Buffer, offset?: number): Buffer;
    bytes: number;
}
declare const encode: Encode;
interface Decode {
    (buffer: Buffer, offset?: number): number;
    bytes: number;
}
declare const decode: Decode;
declare function encodingLength(num: number): number;
export { encode, decode, encodingLength };
