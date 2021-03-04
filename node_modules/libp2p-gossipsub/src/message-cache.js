"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageCache = void 0;
const utils_1 = require("./utils");
class MessageCache {
    /**
     * @param {Number} gossip
     * @param {Number} history
     * @param {msgIdFn} msgIdFn a function that returns message id from a message
     *
     * @constructor
     */
    constructor(gossip, history, msgIdFn) {
        /**
         * @type {Map<string, RPC.Message>}
         */
        this.msgs = new Map();
        this.peertx = new Map();
        /**
         * @type {Array<Array<CacheEntry>>}
         */
        this.history = [];
        for (let i = 0; i < history; i++) {
            this.history[i] = [];
        }
        /**
         * @type {Number}
         */
        this.gossip = gossip;
        /**
         * @type {Function}
         */
        this.msgIdFn = msgIdFn;
    }
    /**
     * Adds a message to the current window and the cache
     *
     * @param {RPC.Message} msg
     * @returns {void}
     */
    put(msg) {
        const msgID = this.getMsgId(msg);
        const msgIdStr = utils_1.messageIdToString(msgID);
        this.msgs.set(msgIdStr, msg);
        this.history[0].push({ msgID, topics: msg.topicIDs });
    }
    /**
     * Get message id of message.
     * @param {RPC.Message} msg
     * @returns {Uint8Array}
     */
    getMsgId(msg) {
        return this.msgIdFn(msg);
    }
    /**
     * Retrieves a message from the cache by its ID, if it is still present
     *
     * @param {Uint8Array} msgID
     * @returns {Message}
     */
    get(msgID) {
        return this.msgs.get(utils_1.messageIdToString(msgID));
    }
    /**
     * Retrieves a message from the cache by its ID, if it is present
     * for a specific peer.
     * Returns the message and the number of times the peer has requested the message
     *
     * @param {string} msgID
     * @param {string} p
     * @returns {[InMessage | undefined, number]}
     */
    getForPeer(msgID, p) {
        const msgIdStr = utils_1.messageIdToString(msgID);
        const msg = this.msgs.get(msgIdStr);
        if (!msg) {
            return [undefined, 0];
        }
        let peertx = this.peertx.get(msgIdStr);
        if (!peertx) {
            peertx = new Map();
            this.peertx.set(msgIdStr, peertx);
        }
        const count = (peertx.get(p) || 0) + 1;
        peertx.set(p, count);
        return [msg, count];
    }
    /**
     * Retrieves a list of message IDs for a given topic
     *
     * @param {String} topic
     *
     * @returns {Array<Uint8Array>}
     */
    getGossipIDs(topic) {
        const msgIDs = [];
        for (let i = 0; i < this.gossip; i++) {
            this.history[i].forEach((entry) => {
                for (const t of entry.topics) {
                    if (t === topic) {
                        msgIDs.push(entry.msgID);
                        break;
                    }
                }
            });
        }
        return msgIDs;
    }
    /**
     * Shifts the current window, discarding messages older than this.history.length of the cache
     *
     * @returns {void}
     */
    shift() {
        const last = this.history[this.history.length - 1];
        last.forEach((entry) => {
            const msgIdStr = utils_1.messageIdToString(entry.msgID);
            this.msgs.delete(msgIdStr);
            this.peertx.delete(msgIdStr);
        });
        this.history.pop();
        this.history.unshift([]);
    }
}
exports.MessageCache = MessageCache;
