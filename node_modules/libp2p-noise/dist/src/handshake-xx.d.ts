/// <reference types="node" />
import { XX } from './handshakes/xx';
import { KeyPair } from './@types/libp2p';
import { bytes, bytes32 } from './@types/basic';
import { NoiseSession } from './@types/handshake';
import { IHandshake } from './@types/handshake-interface';
import { WrappedConnection } from './noise';
import PeerId from 'peer-id';
export declare class XXHandshake implements IHandshake {
    isInitiator: boolean;
    session: NoiseSession;
    remotePeer: PeerId;
    remoteEarlyData: Buffer;
    protected payload: bytes;
    protected connection: WrappedConnection;
    protected xx: XX;
    protected staticKeypair: KeyPair;
    private readonly prologue;
    constructor(isInitiator: boolean, payload: bytes, prologue: bytes32, staticKeypair: KeyPair, connection: WrappedConnection, remotePeer?: PeerId, handshake?: XX);
    propose(): Promise<void>;
    exchange(): Promise<void>;
    finish(): Promise<void>;
    encrypt(plaintext: bytes, session: NoiseSession): bytes;
    decrypt(ciphertext: bytes, session: NoiseSession): {
        plaintext: bytes;
        valid: boolean;
    };
    getRemoteStaticKey(): bytes;
    private getCS;
    protected setRemoteEarlyData(data: Uint8Array | null | undefined): void;
}
//# sourceMappingURL=handshake-xx.d.ts.map