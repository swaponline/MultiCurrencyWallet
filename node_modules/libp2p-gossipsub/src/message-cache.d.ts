import { InMessage } from 'libp2p-interfaces/src/pubsub';
import { MessageIdFunction } from './interfaces';
export interface CacheEntry {
    msgID: Uint8Array;
    topics: string[];
}
export declare class MessageCache {
    msgs: Map<string, InMessage>;
    peertx: Map<string, Map<string, number>>;
    history: CacheEntry[][];
    gossip: number;
    msgIdFn: MessageIdFunction;
    /**
     * @param {Number} gossip
     * @param {Number} history
     * @param {msgIdFn} msgIdFn a function that returns message id from a message
     *
     * @constructor
     */
    constructor(gossip: number, history: number, msgIdFn: MessageIdFunction);
    /**
     * Adds a message to the current window and the cache
     *
     * @param {RPC.Message} msg
     * @returns {void}
     */
    put(msg: InMessage): void;
    /**
     * Get message id of message.
     * @param {RPC.Message} msg
     * @returns {Uint8Array}
     */
    getMsgId(msg: InMessage): Uint8Array;
    /**
     * Retrieves a message from the cache by its ID, if it is still present
     *
     * @param {Uint8Array} msgID
     * @returns {Message}
     */
    get(msgID: Uint8Array): InMessage | undefined;
    /**
     * Retrieves a message from the cache by its ID, if it is present
     * for a specific peer.
     * Returns the message and the number of times the peer has requested the message
     *
     * @param {string} msgID
     * @param {string} p
     * @returns {[InMessage | undefined, number]}
     */
    getForPeer(msgID: Uint8Array, p: string): [InMessage | undefined, number];
    /**
     * Retrieves a list of message IDs for a given topic
     *
     * @param {String} topic
     *
     * @returns {Array<Uint8Array>}
     */
    getGossipIDs(topic: string): Uint8Array[];
    /**
     * Shifts the current window, discarding messages older than this.history.length of the cache
     *
     * @returns {void}
     */
    shift(): void;
}
