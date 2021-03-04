import { InMessage } from 'libp2p-interfaces/src/pubsub';
import PeerId = require('peer-id');
import Multiaddr = require('multiaddr');
export interface AddrInfo {
    id: PeerId;
    addrs: Multiaddr[];
}
export declare type MessageIdFunction = (msg: InMessage) => Uint8Array;
