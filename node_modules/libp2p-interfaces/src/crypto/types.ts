import PeerId from 'peer-id'
import { MultiaddrConnection } from '../transport/types'

/**
 * A libp2p crypto module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface Crypto {
  protocol: string;
  /**
   * Encrypt outgoing data to the remote party.
   */
  secureOutbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId): Promise<SecureOutbound>;
  /**
   * Decrypt incoming data.
   */
  secureInbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId): Promise<SecureOutbound>;
}

export type SecureOutbound = {
  conn: MultiaddrConnection;
  remoteEarlyData: Buffer;
  remotePeer: PeerId;
}
