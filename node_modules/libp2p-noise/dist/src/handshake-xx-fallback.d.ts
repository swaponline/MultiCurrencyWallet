import { XXHandshake } from './handshake-xx';
import { XX } from './handshakes/xx';
import { KeyPair } from './@types/libp2p';
import { bytes, bytes32 } from './@types/basic';
import { WrappedConnection } from './noise';
import PeerId from 'peer-id';
export declare class XXFallbackHandshake extends XXHandshake {
    private readonly ephemeralKeys?;
    private readonly initialMsg;
    constructor(isInitiator: boolean, payload: bytes, prologue: bytes32, staticKeypair: KeyPair, connection: WrappedConnection, initialMsg: bytes, remotePeer?: PeerId, ephemeralKeys?: KeyPair, handshake?: XX);
    propose(): Promise<void>;
    exchange(): Promise<void>;
}
//# sourceMappingURL=handshake-xx-fallback.d.ts.map