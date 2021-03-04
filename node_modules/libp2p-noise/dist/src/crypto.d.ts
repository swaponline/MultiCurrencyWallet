import { IHandshake } from './@types/handshake-interface';
interface IReturnEncryptionWrapper {
    (source: Iterable<Uint8Array>): AsyncIterableIterator<Uint8Array>;
}
export declare function encryptStream(handshake: IHandshake): IReturnEncryptionWrapper;
export declare function decryptStream(handshake: IHandshake): IReturnEncryptionWrapper;
export {};
//# sourceMappingURL=crypto.d.ts.map