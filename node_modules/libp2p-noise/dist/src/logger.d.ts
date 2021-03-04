/// <reference types="node" />
import { KeyPair } from './@types/libp2p';
import { NoiseSession } from './@types/handshake';
export declare const logger: any;
export declare function logLocalStaticKeys(s: KeyPair): void;
export declare function logLocalEphemeralKeys(e: KeyPair | undefined): void;
export declare function logRemoteStaticKey(rs: Buffer): void;
export declare function logRemoteEphemeralKey(re: Buffer): void;
export declare function logCipherState(session: NoiseSession): void;
//# sourceMappingURL=logger.d.ts.map