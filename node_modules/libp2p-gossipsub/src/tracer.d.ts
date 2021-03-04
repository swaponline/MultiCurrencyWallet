import { InMessage } from 'libp2p-interfaces/src/pubsub';
import { MessageIdFunction } from './interfaces';
/**
 * IWantTracer is an internal tracer that tracks IWANT requests in order to penalize
 * peers who don't follow up on IWANT requests after an IHAVE advertisement.
 * The tracking of promises is probabilistic to avoid using too much memory.
 *
 * Note: Do not confuse these 'promises' with JS Promise objects.
 * These 'promises' are merely expectations of a peer's behavior.
 */
export declare class IWantTracer {
    getMsgId: MessageIdFunction;
    /**
     * Promises to deliver a message
     * Map per message id, per peer, promise expiration time
     */
    promises: Map<string, Map<string, number>>;
    constructor(getMsgId: MessageIdFunction);
    /**
     * Track a promise to deliver a message from a list of msgIDs we are requesting
     * @param {string} p peer id
     * @param {string[]} msgIds
     * @returns {void}
     */
    addPromise(p: string, msgIds: Uint8Array[]): void;
    /**
     * Returns the number of broken promises for each peer who didn't follow up on an IWANT request.
     * @returns {Map<string, number>}
     */
    getBrokenPromises(): Map<string, number>;
    /**
     * Someone delivered a message, stop tracking promises for it
     * @param {InMessage} msg
     * @returns {void}
     */
    deliverMessage(msg: InMessage): void;
    /**
     * A message got rejected, so we can stop tracking promises and let the score penalty apply from invalid message delivery,
     * unless its an obviously invalid message.
     * @param {InMessage} msg
     * @param {string} reason
     * @returns {void}
     */
    rejectMessage(msg: InMessage, reason: string): void;
    clear(): void;
}
