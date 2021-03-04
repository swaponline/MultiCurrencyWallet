/// <reference types="node" />
import { PeerScoreParams } from './peer-score-params';
import { PeerStats } from './peer-stats';
import { MessageDeliveries } from './message-deliveries';
import { MessageIdFunction } from '../interfaces';
import ConnectionManager from 'libp2p/src/connection-manager';
import { InMessage } from 'libp2p-interfaces/src/pubsub';
export declare class PeerScore {
    /**
     * The score parameters
     */
    params: PeerScoreParams;
    /**
     * Per-peer stats for score calculation
     */
    peerStats: Map<string, PeerStats>;
    /**
     * IP colocation tracking; maps IP => set of peers.
     */
    peerIPs: Map<string, Set<string>>;
    /**
     * Recent message delivery timing/participants
     */
    deliveryRecords: MessageDeliveries;
    /**
     * Message ID function
     */
    msgId: MessageIdFunction;
    _connectionManager: ConnectionManager;
    _backgroundInterval?: NodeJS.Timeout;
    constructor(params: PeerScoreParams, connectionManager: ConnectionManager, msgId: MessageIdFunction);
    /**
     * Start PeerScore instance
     * @returns {void}
     */
    start(): void;
    /**
     * Stop PeerScore instance
     * @returns {void}
     */
    stop(): void;
    /**
     * Periodic maintenance
     * @returns {void}
     */
    background(): void;
    /**
     * Decays scores, and purges score records for disconnected peers once their expiry has elapsed.
     * @returns {void}
     */
    _refreshScores(): void;
    /**
     * Return the score for a peer
     * @param {string} id
     * @returns {Number}
     */
    score(id: string): number;
    /**
     * Apply a behavioural penalty to a peer
     * @param {string} id
     * @param {Number} penalty
     * @returns {void}
     */
    addPenalty(id: string, penalty: number): void;
    /**
     * @param {string} id
     * @returns {void}
     */
    addPeer(id: string): void;
    /**
     * @param {string} id
     * @returns {void}
     */
    removePeer(id: string): void;
    /**
     * @param {string} id
     * @param {String} topic
     * @returns {void}
     */
    graft(id: string, topic: string): void;
    /**
     * @param {string} id
     * @param {string} topic
     * @returns {void}
     */
    prune(id: string, topic: string): void;
    /**
     * @param {InMessage} message
     * @returns {void}
     */
    validateMessage(message: InMessage): void;
    /**
     * @param {InMessage} message
     * @returns {void}
     */
    deliverMessage(message: InMessage): void;
    /**
     * @param {InMessage} message
     * @param {string} reason
     * @returns {void}
     */
    rejectMessage(message: InMessage, reason: string): void;
    /**
     * @param {InMessage} message
     * @returns {void}
     */
    duplicateMessage(message: InMessage): void;
    /**
     * Increments the "invalid message deliveries" counter for all scored topics the message is published in.
     * @param {string} id
     * @param {InMessage} message
     * @returns {void}
     */
    _markInvalidMessageDelivery(id: string, message: InMessage): void;
    /**
     * Increments the "first message deliveries" counter for all scored topics the message is published in,
     * as well as the "mesh message deliveries" counter, if the peer is in the mesh for the topic.
     * @param {string} id
     * @param {InMessage} message
     * @returns {void}
     */
    _markFirstMessageDelivery(id: string, message: InMessage): void;
    /**
     * Increments the "mesh message deliveries" counter for messages we've seen before,
     * as long the message was received within the P3 window.
     * @param {string} id
     * @param {InMessage} message
     * @param {number} validatedTime
     * @returns {void}
     */
    _markDuplicateMessageDelivery(id: string, message: InMessage, validatedTime?: number): void;
    /**
     * Gets the current IPs for a peer.
     * @param {string} id
     * @returns {Array<string>}
     */
    _getIPs(id: string): string[];
    /**
     * Adds tracking for the new IPs in the list, and removes tracking from the obsolete IPs.
     * @param {string} id
     * @param {Array<string>} newIPs
     * @param {Array<string>} oldIPs
     * @returns {void}
     */
    _setIPs(id: string, newIPs: string[], oldIPs: string[]): void;
    /**
     * Removes an IP list from the tracking list for a peer.
     * @param {string} id
     * @param {Array<string>} ips
     * @returns {void}
     */
    _removeIPs(id: string, ips: string[]): void;
    /**
     * Update all peer IPs to currently open connections
     * @returns {void}
     */
    _updateIPs(): void;
}
