import { MessageBuffer, NoiseSession } from '../@types/handshake';
import { bytes, bytes32 } from '../@types/basic';
import { AbstractHandshake } from './abstract-handshake';
import { KeyPair } from '../@types/libp2p';
export declare class IK extends AbstractHandshake {
    initSession(initiator: boolean, prologue: bytes32, s: KeyPair, rs: bytes32): NoiseSession;
    sendMessage(session: NoiseSession, message: bytes): MessageBuffer;
    recvMessage(session: NoiseSession, message: MessageBuffer): {
        plaintext: bytes;
        valid: boolean;
    };
    private writeMessageA;
    private writeMessageB;
    private readMessageA;
    private readMessageB;
    private initializeInitiator;
    private initializeResponder;
}
//# sourceMappingURL=ik.d.ts.map