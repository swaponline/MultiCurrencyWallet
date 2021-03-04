import { bytes, bytes32, uint32 } from '../@types/basic';
import { CipherState, MessageBuffer, SymmetricState } from '../@types/handshake';
export declare const MIN_NONCE = 0;
export declare abstract class AbstractHandshake {
    encryptWithAd(cs: CipherState, ad: bytes, plaintext: bytes): bytes;
    decryptWithAd(cs: CipherState, ad: bytes, ciphertext: bytes): {
        plaintext: bytes;
        valid: boolean;
    };
    protected hasKey(cs: CipherState): boolean;
    protected setNonce(cs: CipherState, nonce: uint32): void;
    protected createEmptyKey(): bytes32;
    protected isEmptyKey(k: bytes32): boolean;
    protected incrementNonce(n: uint32): uint32;
    protected nonceToBytes(n: uint32): bytes;
    protected encrypt(k: bytes32, n: uint32, ad: bytes, plaintext: bytes): bytes;
    protected encryptAndHash(ss: SymmetricState, plaintext: bytes): bytes;
    protected decrypt(k: bytes32, n: uint32, ad: bytes, ciphertext: bytes): {
        plaintext: bytes;
        valid: boolean;
    };
    protected decryptAndHash(ss: SymmetricState, ciphertext: bytes): {
        plaintext: bytes;
        valid: boolean;
    };
    protected dh(privateKey: bytes32, publicKey: bytes32): bytes32;
    protected mixHash(ss: SymmetricState, data: bytes): void;
    protected getHash(a: bytes, b: bytes): bytes32;
    protected mixKey(ss: SymmetricState, ikm: bytes32): void;
    protected initializeKey(k: bytes32): CipherState;
    protected initializeSymmetric(protocolName: string): SymmetricState;
    protected hashProtocolName(protocolName: bytes): bytes32;
    protected split(ss: SymmetricState): {
        cs1: CipherState;
        cs2: CipherState;
    };
    protected writeMessageRegular(cs: CipherState, payload: bytes): MessageBuffer;
    protected readMessageRegular(cs: CipherState, message: MessageBuffer): {
        plaintext: bytes;
        valid: boolean;
    };
}
//# sourceMappingURL=abstract-handshake.d.ts.map