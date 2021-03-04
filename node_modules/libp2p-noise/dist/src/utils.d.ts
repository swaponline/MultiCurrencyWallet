import PeerId from 'peer-id';
import { KeyPair } from './@types/libp2p';
import { bytes, bytes32 } from './@types/basic';
import { Hkdf } from './@types/handshake';
import { pb } from './proto/payload';
export declare function generateKeypair(): KeyPair;
export declare function getPayload(localPeer: PeerId, staticPublicKey: bytes, earlyData?: bytes): Promise<bytes>;
export declare function createHandshakePayload(libp2pPublicKey: Uint8Array, signedPayload: Uint8Array, earlyData?: Uint8Array): bytes;
export declare function signPayload(peerId: PeerId, payload: bytes): Promise<bytes>;
export declare function getPeerIdFromPayload(payload: pb.INoiseHandshakePayload): Promise<PeerId>;
export declare function decodePayload(payload: bytes | Uint8Array): pb.INoiseHandshakePayload;
export declare function getHandshakePayload(publicKey: bytes): bytes;
/**
 * Verifies signed payload, throws on any irregularities.
 *
 * @param {bytes} noiseStaticKey - owner's noise static key
 * @param {bytes} payload - decoded payload
 * @param {PeerId} remotePeer - owner's libp2p peer ID
 * @returns {Promise<PeerId>} - peer ID of payload owner
 */
export declare function verifySignedPayload(noiseStaticKey: bytes, payload: pb.INoiseHandshakePayload, remotePeer: PeerId): Promise<PeerId>;
export declare function getHkdf(ck: bytes32, ikm: bytes): Hkdf;
export declare function isValidPublicKey(pk: bytes): boolean;
//# sourceMappingURL=utils.d.ts.map