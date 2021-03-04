/// <reference types="node" />
import { WrappedConnection } from './noise';
import { IK } from './handshakes/ik';
import { NoiseSession } from './@types/handshake';
import { bytes, bytes32 } from './@types/basic';
import { KeyPair } from './@types/libp2p';
import { IHandshake } from './@types/handshake-interface';
import PeerId from 'peer-id';
export declare class IKHandshake implements IHandshake {
    isInitiator: boolean;
    session: NoiseSession;
    remotePeer: PeerId;
    remoteEarlyData: Buffer;
    private readonly payload;
    private readonly prologue;
    private readonly staticKeypair;
    private readonly connection;
    private readonly ik;
    constructor(isInitiator: boolean, payload: bytes, prologue: bytes32, staticKeypair: KeyPair, connection: WrappedConnection, remoteStaticKey: bytes, remotePeer?: PeerId, handshake?: IK);
    stage0(): Promise<void>;
    stage1(): Promise<void>;
    decrypt(ciphertext: bytes, session: NoiseSession): {
        plaintext: bytes;
        valid: boolean;
    };
    encrypt(plaintext: Buffer, session: NoiseSession): Buffer;
    getLocalEphemeralKeys(): KeyPair;
    private getCS;
    private setRemoteEarlyData;
}
//# sourceMappingURL=handshake-ik.d.ts.map