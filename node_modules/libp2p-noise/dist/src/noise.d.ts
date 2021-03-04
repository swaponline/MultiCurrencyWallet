import Wrap from 'it-pb-rpc';
import { bytes } from './@types/basic';
import { INoiseConnection, SecureOutbound } from './@types/libp2p';
import PeerId from 'peer-id';
export declare type WrappedConnection = ReturnType<typeof Wrap>;
export declare class Noise implements INoiseConnection {
    protocol: string;
    private readonly prologue;
    private readonly staticKeys;
    private readonly earlyData?;
    private readonly useNoisePipes;
    /**
     *
     * @param {bytes} staticNoiseKey - x25519 private key, reuse for faster handshakes
     * @param {bytes} earlyData
     */
    constructor(staticNoiseKey?: bytes, earlyData?: bytes);
    /**
     * Encrypt outgoing data to the remote party (handshake as initiator)
     *
     * @param {PeerId} localPeer - PeerId of the receiving peer
     * @param {any} connection - streaming iterable duplex that will be encrypted
     * @param {PeerId} remotePeer - PeerId of the remote peer. Used to validate the integrity of the remote peer.
     * @returns {Promise<SecureOutbound>}
     */
    secureOutbound(localPeer: PeerId, connection: any, remotePeer: PeerId): Promise<SecureOutbound>;
    /**
     * Decrypt incoming data (handshake as responder).
     *
     * @param {PeerId} localPeer - PeerId of the receiving peer.
     * @param {any} connection - streaming iterable duplex that will be encryption.
     * @param {PeerId} remotePeer - optional PeerId of the initiating peer, if known. This may only exist during transport upgrades.
     * @returns {Promise<SecureOutbound>}
     */
    secureInbound(localPeer: PeerId, connection: any, remotePeer?: PeerId): Promise<SecureOutbound>;
    /**
     * If Noise pipes supported, tries IK handshake first with XX as fallback if it fails.
     * If noise pipes disabled or remote peer static key is unknown, use XX.
     *
     * @param {HandshakeParams} params
     */
    private performHandshake;
    private performXXFallbackHandshake;
    private performXXHandshake;
    private performIKHandshake;
    private createSecureConnection;
}
//# sourceMappingURL=noise.d.ts.map