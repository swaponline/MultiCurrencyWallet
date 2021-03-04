import { bytes32, bytes } from '../@types/basic';
import { KeyPair } from '../@types/libp2p';
import { MessageBuffer, NoiseSession } from '../@types/handshake';
import { AbstractHandshake } from './abstract-handshake';
export declare class XX extends AbstractHandshake {
    private initializeInitiator;
    private initializeResponder;
    private writeMessageA;
    private writeMessageB;
    private writeMessageC;
    private readMessageA;
    private readMessageB;
    private readMessageC;
    initSession(initiator: boolean, prologue: bytes32, s: KeyPair): NoiseSession;
    sendMessage(session: NoiseSession, message: bytes, ephemeral?: KeyPair): MessageBuffer;
    recvMessage(session: NoiseSession, message: MessageBuffer): {
        plaintext: bytes;
        valid: boolean;
    };
}
//# sourceMappingURL=xx.d.ts.map