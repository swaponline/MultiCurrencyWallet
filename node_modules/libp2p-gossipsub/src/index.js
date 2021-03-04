"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pubsub_1 = __importStar(require("libp2p-interfaces/src/pubsub"));
const message_cache_1 = require("./message-cache");
const message_1 = require("./message");
const constants = __importStar(require("./constants"));
const heartbeat_1 = require("./heartbeat");
const get_gossip_peers_1 = require("./get-gossip-peers");
const utils_1 = require("./utils");
const score_1 = require("./score");
const tracer_1 = require("./tracer");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const TimeCache = require("time-cache");
const PeerId = require("peer-id");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Envelope = require("libp2p/src/record/envelope");
class Gossipsub extends pubsub_1.default {
    // TODO: add remaining props
    /**
     * @param {Libp2p} libp2p
     * @param {Object} [options]
     * @param {boolean} [options.emitSelf = false] if publish should emit to self, if subscribed
     * @param {boolean} [options.canRelayMessage = false] - if can relay messages not subscribed
     * @param {boolean} [options.gossipIncoming = true] if incoming messages on a subscribed topic should be automatically gossiped
     * @param {boolean} [options.fallbackToFloodsub = true] if dial should fallback to floodsub
     * @param {boolean} [options.floodPublish = true] if self-published messages should be sent to all peers
     * @param {boolean} [options.doPX = false] whether PX is enabled; this should be enabled in bootstrappers and other well connected/trusted nodes.
     * @param {Object} [options.messageCache] override the default MessageCache
     * @param {string} [options.globalSignaturePolicy = "StrictSign"] signing policy to apply across all messages
     * @param {Object} [options.scoreParams] peer score parameters
     * @param {Object} [options.scoreThresholds] peer score thresholds
     * @param {AddrInfo[]} [options.directPeers] peers with which we will maintain direct connections
     * @constructor
     */
    constructor(libp2p, options = {}) {
        const multicodecs = [constants.GossipsubIDv11, constants.GossipsubIDv10];
        const opts = Object.assign(Object.assign({ gossipIncoming: true, fallbackToFloodsub: true, floodPublish: true, doPX: false, directPeers: [], D: constants.GossipsubD, Dlo: constants.GossipsubDlo, Dhi: constants.GossipsubDhi, Dscore: constants.GossipsubDscore, Dout: constants.GossipsubDout, Dlazy: constants.GossipsubDlazy }, options), { scoreParams: score_1.createPeerScoreParams(options.scoreParams), scoreThresholds: score_1.createPeerScoreThresholds(options.scoreThresholds) });
        // Also wants to get notified of peers connected using floodsub
        if (opts.fallbackToFloodsub) {
            multicodecs.push(constants.FloodsubID);
        }
        super(Object.assign({ debugName: 'libp2p:gossipsub', multicodecs,
            libp2p }, opts));
        this._options = opts;
        /**
         * Direct peers
         * @type {Set<string>}
         */
        this.direct = new Set(opts.directPeers.map(p => p.id.toB58String()));
        // set direct peer addresses in the address book
        opts.directPeers.forEach(p => {
            libp2p.peerStore.addressBook.add(p.id, p.addrs);
        });
        /**
         * Cache of seen messages
         *
         * @type {TimeCache}
         */
        this.seenCache = new TimeCache();
        /**
         * Map of topic meshes
         * topic => peer id set
         *
         * @type {Map<string, Set<string>>}
         */
        this.mesh = new Map();
        /**
         * Map of topics to set of peers. These mesh peers are the ones to which we are publishing without a topic membership
         * topic => peer id set
         *
         * @type {Map<string, Set<string>>}
         */
        this.fanout = new Map();
        /**
         * Map of last publish time for fanout topics
         * topic => last publish time
         *
         * @type {Map<string, number>}
         */
        this.lastpub = new Map();
        /**
         * Map of pending messages to gossip
         * peer id => control messages
         *
         * @type {Map<string, Array<ControlIHave object>> }
         */
        this.gossip = new Map();
        /**
         * Map of control messages
         * peer id => control message
         *
         * @type {Map<string, ControlMessage object>}
         */
        this.control = new Map();
        /**
         * Number of IHAVEs received from peer in the last heartbeat
         * @type {Map<string, number>}
         */
        this.peerhave = new Map();
        /**
         * Number of messages we have asked from peer in the last heartbeat
         * @type {Map<string, number>}
         */
        this.iasked = new Map();
        /**
         * Prune backoff map
         */
        this.backoff = new Map();
        /**
         * Connection direction cache, marks peers with outbound connections
         * peer id => direction
         *
         * @type {Map<string, boolean>}
         */
        this.outbound = new Map();
        /**
         * A message cache that contains the messages for last few hearbeat ticks
         *
         */
        this.messageCache = options.messageCache || new message_cache_1.MessageCache(constants.GossipsubHistoryGossip, constants.GossipsubHistoryLength, this.getMsgId.bind(this));
        /**
         * A heartbeat timer that maintains the mesh
         */
        this.heartbeat = new heartbeat_1.Heartbeat(this);
        /**
         * Number of heartbeats since the beginning of time
         * This allows us to amortize some resource cleanup -- eg: backoff cleanup
         */
        this.heartbeatTicks = 0;
        /**
         * Tracks IHAVE/IWANT promises broken by peers
         */
        this.gossipTracer = new tracer_1.IWantTracer(this.getMsgId.bind(this));
        /**
         * libp2p
         */
        this._libp2p = libp2p;
        /**
         * Peer score tracking
         */
        this.score = new score_1.PeerScore(this._options.scoreParams, libp2p.connectionManager, this.getMsgId.bind(this));
    }
    /**
     * Decode a Uint8Array into an RPC object
     * Overrided to use an extended protocol-specific protobuf decoder
     * @override
     * @param {Uint8Array} bytes
     * @returns {RPC}
     */
    _decodeRpc(bytes) {
        return message_1.RPCCodec.decode(bytes);
    }
    /**
     * Encode an RPC object into a Uint8Array
     * Overrided to use an extended protocol-specific protobuf encoder
     * @override
     * @param {RPC} rpc
     * @returns {Uint8Array}
     */
    _encodeRpc(rpc) {
        return message_1.RPCCodec.encode(rpc);
    }
    /**
     * Add a peer to the router
     * @override
     * @param {PeerId} peerId
     * @param {string} protocol
     * @returns {PeerStreams}
     */
    _addPeer(peerId, protocol) {
        const p = super._addPeer(peerId, protocol);
        // Add to peer scoring
        this.score.addPeer(peerId.toB58String());
        // track the connection direction
        let outbound = false;
        for (const c of this._libp2p.connectionManager.getAll(peerId)) {
            if (c.stat.direction === 'outbound') {
                if (Array.from(c.registry.values()).some(rvalue => protocol === rvalue.protocol)) {
                    outbound = true;
                    break;
                }
            }
        }
        this.outbound.set(p.id.toB58String(), outbound);
        return p;
    }
    /**
     * Removes a peer from the router
     * @override
     * @param {PeerId} peer
     * @returns {PeerStreams | undefined}
     */
    _removePeer(peerId) {
        const peerStreams = super._removePeer(peerId);
        const id = peerId.toB58String();
        // Remove this peer from the mesh
        // eslint-disable-next-line no-unused-vars
        for (const peers of this.mesh.values()) {
            peers.delete(id);
        }
        // Remove this peer from the fanout
        // eslint-disable-next-line no-unused-vars
        for (const peers of this.fanout.values()) {
            peers.delete(id);
        }
        // Remove from gossip mapping
        this.gossip.delete(id);
        // Remove from control mapping
        this.control.delete(id);
        // Remove from backoff mapping
        this.outbound.delete(id);
        // Remove from peer scoring
        this.score.removePeer(id);
        return peerStreams;
    }
    /**
     * Handles an rpc request from a peer
     *
     * @override
     * @param {String} idB58Str
     * @param {PeerStreams} peerStreams
     * @param {RPC} rpc
     * @returns {boolean}
     */
    _processRpc(id, peerStreams, rpc) {
        if (super._processRpc(id, peerStreams, rpc)) {
            if (rpc.control) {
                this._processRpcControlMessage(id, rpc.control);
            }
            return true;
        }
        return false;
    }
    /**
     * Handles an rpc control message from a peer
     * @param {string} id peer id
     * @param {ControlMessage} controlMsg
     * @returns {void}
     */
    _processRpcControlMessage(id, controlMsg) {
        if (!controlMsg) {
            return;
        }
        const iwant = this._handleIHave(id, controlMsg.ihave);
        const ihave = this._handleIWant(id, controlMsg.iwant);
        const prune = this._handleGraft(id, controlMsg.graft);
        this._handlePrune(id, controlMsg.prune);
        if (!iwant.length && !ihave.length && !prune.length) {
            return;
        }
        const outRpc = utils_1.createGossipRpc(ihave, { iwant, prune });
        this._sendRpc(id, outRpc);
    }
    /**
     * Process incoming message,
     * emitting locally and forwarding on to relevant floodsub and gossipsub peers
     * @override
     * @param {InMessage} msg
     * @returns {Promise<void>}
     */
    _processRpcMessage(msg) {
        const _super = Object.create(null, {
            _processRpcMessage: { get: () => super._processRpcMessage }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const msgID = this.getMsgId(msg);
            const msgIdStr = utils_1.messageIdToString(msgID);
            // Ignore if we've already seen the message
            if (this.seenCache.has(msgIdStr)) {
                this.score.duplicateMessage(msg);
                return;
            }
            this.seenCache.put(msgIdStr);
            this.score.validateMessage(msg);
            yield _super._processRpcMessage.call(this, msg);
        });
    }
    /**
     * Whether to accept a message from a peer
     * @override
     * @param {string} id
     * @returns {boolean}
     */
    _acceptFrom(id) {
        return this.direct.has(id) || this.score.score(id) >= this._options.scoreThresholds.graylistThreshold;
    }
    /**
     * Validate incoming message
     * @override
     * @param {InMessage} message
     * @returns {Promise<void>}
     */
    validate(message) {
        const _super = Object.create(null, {
            validate: { get: () => super.validate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield _super.validate.call(this, message);
            }
            catch (e) {
                this.score.rejectMessage(message, e.code);
                this.gossipTracer.rejectMessage(message, e.code);
                throw e;
            }
        });
    }
    /**
     * Handles IHAVE messages
     * @param {string} id peer id
     * @param {Array<ControlIHave>} ihave
     * @returns {ControlIWant}
     */
    _handleIHave(id, ihave) {
        if (!ihave.length) {
            return [];
        }
        // we ignore IHAVE gossip from any peer whose score is below the gossips threshold
        const score = this.score.score(id);
        if (score < this._options.scoreThresholds.gossipThreshold) {
            this.log('IHAVE: ignoring peer %s with score below threshold [ score = %d ]', id, score);
            return [];
        }
        // IHAVE flood protection
        const peerhave = (this.peerhave.get(id) || 0) + 1;
        this.peerhave.set(id, peerhave);
        if (peerhave > constants.GossipsubMaxIHaveMessages) {
            this.log('IHAVE: peer %s has advertised too many times (%d) within this heartbeat interval; ignoring', id, peerhave);
            return [];
        }
        const iasked = this.iasked.get(id) || 0;
        if (iasked >= constants.GossipsubMaxIHaveLength) {
            this.log('IHAVE: peer %s has already advertised too many messages (%d); ignoring', id, iasked);
            return [];
        }
        // string msgId => msgId
        const iwant = new Map();
        ihave.forEach(({ topicID, messageIDs }) => {
            if (!topicID || !this.mesh.has(topicID)) {
                return;
            }
            messageIDs.forEach((msgID) => {
                const msgIdStr = utils_1.messageIdToString(msgID);
                if (this.seenCache.has(msgIdStr)) {
                    return;
                }
                iwant.set(msgIdStr, msgID);
            });
        });
        if (!iwant.size) {
            return [];
        }
        let iask = iwant.size;
        if (iask + iasked > constants.GossipsubMaxIHaveLength) {
            iask = constants.GossipsubMaxIHaveLength - iasked;
        }
        this.log('IHAVE: Asking for %d out of %d messages from %s', iask, iwant.size, id);
        let iwantList = Array.from(iwant.values());
        // ask in random order
        utils_1.shuffle(iwantList);
        // truncate to the messages we are actually asking for and update the iasked counter
        iwantList = iwantList.slice(0, iask);
        this.iasked.set(id, iasked + iask);
        this.gossipTracer.addPromise(id, iwantList);
        return [{
                messageIDs: iwantList
            }];
    }
    /**
     * Handles IWANT messages
     * Returns messages to send back to peer
     * @param {string} id peer id
     * @param {Array<ControlIWant>} iwant
     * @returns {Array<Message>}
     */
    _handleIWant(id, iwant) {
        if (!iwant.length) {
            return [];
        }
        // we don't respond to IWANT requests from any per whose score is below the gossip threshold
        const score = this.score.score(id);
        if (score < this._options.scoreThresholds.gossipThreshold) {
            this.log('IWANT: ignoring peer %s with score below threshold [score = %d]', id, score);
            return [];
        }
        // @type {Map<string, Message>}
        const ihave = new Map();
        iwant.forEach(({ messageIDs }) => {
            messageIDs.forEach((msgID) => {
                const [msg, count] = this.messageCache.getForPeer(msgID, id);
                if (!msg) {
                    return;
                }
                if (count > constants.GossipsubGossipRetransmission) {
                    this.log('IWANT: Peer %s has asked for message %s too many times: ignoring request', id, msgID);
                    return;
                }
                ihave.set(utils_1.messageIdToString(msgID), msg);
            });
        });
        if (!ihave.size) {
            return [];
        }
        this.log('IWANT: Sending %d messages to %s', ihave.size, id);
        return Array.from(ihave.values()).map(pubsub_1.utils.normalizeOutRpcMessage);
    }
    /**
     * Handles Graft messages
     * @param {string} id peer id
     * @param {Array<ControlGraft>} graft
     * @return {Array<ControlPrune>}
     */
    _handleGraft(id, graft) {
        const prune = [];
        const score = this.score.score(id);
        const now = this._now();
        let doPX = this._options.doPX;
        graft.forEach(({ topicID }) => {
            var _a;
            if (!topicID) {
                return;
            }
            const peersInMesh = this.mesh.get(topicID);
            if (!peersInMesh) {
                // don't do PX when there is an unknown topic to avoid leaking our peers
                doPX = false;
                // spam hardening: ignore GRAFTs for unknown topics
                return;
            }
            // check if peer is already in the mesh; if so do nothing
            if (peersInMesh.has(id)) {
                return;
            }
            // we don't GRAFT to/from direct peers; complain loudly if this happens
            if (this.direct.has(id)) {
                this.log('GRAFT: ignoring request from direct peer %s', id);
                // this is possibly a bug from a non-reciprical configuration; send a PRUNE
                prune.push(topicID);
                // but don't px
                doPX = false;
                return;
            }
            // make sure we are not backing off that peer
            const expire = (_a = this.backoff.get(topicID)) === null || _a === void 0 ? void 0 : _a.get(id);
            if (typeof expire === 'number' && now < expire) {
                this.log('GRAFT: ignoring backed off peer %s', id);
                // add behavioral penalty
                this.score.addPenalty(id, 1);
                // no PX
                doPX = false;
                // check the flood cutoff -- is the GRAFT coming too fast?
                const floodCutoff = expire + constants.GossipsubGraftFloodThreshold - constants.GossipsubPruneBackoff;
                if (now < floodCutoff) {
                    // extra penalty
                    this.score.addPenalty(id, 1);
                }
                // refresh the backoff
                this._addBackoff(id, topicID);
                prune.push(topicID);
                return;
            }
            // check the score
            if (score < 0) {
                // we don't GRAFT peers with negative score
                this.log('GRAFT: ignoring peer %s with negative score: score=%d, topic=%s', id, score, topicID);
                // we do send them PRUNE however, because it's a matter of protocol correctness
                prune.push(topicID);
                // but we won't PX to them
                doPX = false;
                // add/refresh backoff so that we don't reGRAFT too early even if the score decays
                this._addBackoff(id, topicID);
                return;
            }
            // check the number of mesh peers; if it is at (or over) Dhi, we only accept grafts
            // from peers with outbound connections; this is a defensive check to restrict potential
            // mesh takeover attacks combined with love bombing
            if (peersInMesh.size >= this._options.Dhi && !this.outbound.get(id)) {
                prune.push(topicID);
                this._addBackoff(id, topicID);
                return;
            }
            this.log('GRAFT: Add mesh link from %s in %s', id, topicID);
            this.score.graft(id, topicID);
            peersInMesh.add(id);
        });
        if (!prune.length) {
            return [];
        }
        return prune.map(topic => this._makePrune(id, topic, doPX));
    }
    /**
     * Handles Prune messages
     * @param {string} id peer id
     * @param {Array<ControlPrune>} prune
     * @returns {void}
     */
    _handlePrune(id, prune) {
        const score = this.score.score(id);
        prune.forEach(({ topicID, backoff, peers }) => {
            if (!topicID) {
                return;
            }
            const peersInMesh = this.mesh.get(topicID);
            if (!peersInMesh) {
                return;
            }
            this.log('PRUNE: Remove mesh link to %s in %s', id, topicID);
            this.score.prune(id, topicID);
            peersInMesh.delete(id);
            // is there a backoff specified by the peer? if so obey it
            if (typeof backoff === 'number' && backoff > 0) {
                this._doAddBackoff(id, topicID, backoff * 1000);
            }
            else {
                this._addBackoff(id, topicID);
            }
            // PX
            if (peers && peers.length) {
                // we ignore PX from peers with insufficient scores
                if (score < this._options.scoreThresholds.acceptPXThreshold) {
                    this.log('PRUNE: ignoring PX from peer %s with insufficient score [score = %d, topic = %s]', id, score, topicID);
                    return;
                }
                this._pxConnect(peers);
            }
        });
    }
    /**
     * Add standard backoff log for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @returns {void}
     */
    _addBackoff(id, topic) {
        this._doAddBackoff(id, topic, constants.GossipsubPruneBackoff);
    }
    /**
     * Add backoff expiry interval for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @param {number} interval backoff duration in milliseconds
     * @returns {void}
     */
    _doAddBackoff(id, topic, interval) {
        let backoff = this.backoff.get(topic);
        if (!backoff) {
            backoff = new Map();
            this.backoff.set(topic, backoff);
        }
        const expire = this._now() + interval;
        const existingExpire = backoff.get(id) || 0;
        if (existingExpire < expire) {
            backoff.set(id, expire);
        }
    }
    /**
     * Apply penalties from broken IHAVE/IWANT promises
     * @returns {void}
     */
    _applyIwantPenalties() {
        this.gossipTracer.getBrokenPromises().forEach((count, p) => {
            this.log('peer %s didn\'t follow up in %d IWANT requests; adding penalty', p, count);
            this.score.addPenalty(p, count);
        });
    }
    /**
     * Clear expired backoff expiries
     * @returns {void}
     */
    _clearBackoff() {
        // we only clear once every GossipsubPruneBackoffTicks ticks to avoid iterating over the maps too much
        if (this.heartbeatTicks % constants.GossipsubPruneBackoffTicks !== 0) {
            return;
        }
        const now = this._now();
        this.backoff.forEach((backoff, topic) => {
            backoff.forEach((expire, id) => {
                if (expire < now) {
                    backoff.delete(id);
                }
            });
            if (backoff.size === 0) {
                this.backoff.delete(topic);
            }
        });
    }
    /**
     * Maybe reconnect to direct peers
     * @returns {void}
     */
    _directConnect() {
        // we only do this every few ticks to allow pending connections to complete and account for
        // restarts/downtime
        if (this.heartbeatTicks % constants.GossipsubDirectConnectTicks !== 0) {
            return;
        }
        const toconnect = [];
        this.direct.forEach(id => {
            const peer = this.peers.get(id);
            if (!peer || !peer.isWritable) {
                toconnect.push(id);
            }
        });
        if (toconnect.length) {
            toconnect.forEach(id => {
                this._connect(id);
            });
        }
    }
    /**
     * Maybe attempt connection given signed peer records
     * @param {PeerInfo[]} peers
     * @returns {Promise<void>}
     */
    _pxConnect(peers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (peers.length > constants.GossipsubPrunePeers) {
                utils_1.shuffle(peers);
                peers = peers.slice(0, constants.GossipsubPrunePeers);
            }
            const toconnect = [];
            yield Promise.all(peers.map((pi) => __awaiter(this, void 0, void 0, function* () {
                if (!pi.peerID) {
                    return;
                }
                const p = PeerId.createFromBytes(pi.peerID);
                const id = p.toB58String();
                if (this.peers.has(id)) {
                    return;
                }
                if (!pi.signedPeerRecord) {
                    toconnect.push(id);
                    return;
                }
                // The peer sent us a signed record
                // This is not a record from the peer who sent the record, but another peer who is connected with it
                // Ensure that it is valid
                try {
                    const envelope = yield Envelope.openAndCertify(pi.signedPeerRecord, 'libp2p-peer-record');
                    const eid = envelope.peerId.toB58String();
                    if (id !== eid) {
                        this.log('bogus peer record obtained through px: peer ID %s doesn\'t match expected peer %s', eid, id);
                        return;
                    }
                    if (!this._libp2p.peerStore.addressBook.consumePeerRecord(envelope)) {
                        this.log('bogus peer record obtained through px: could not add peer record to address book');
                        return;
                    }
                    toconnect.push(id);
                }
                catch (e) {
                    this.log('bogus peer record obtained through px: invalid signature or not a peer record');
                }
            })));
            if (!toconnect.length) {
                return;
            }
            toconnect.forEach(id => this._connect(id));
        });
    }
    /**
     * Mounts the gossipsub protocol onto the libp2p node and sends our
     * our subscriptions to every peer connected
     * @override
     * @returns {void}
     */
    start() {
        super.start();
        this.heartbeat.start();
        this.score.start();
        // connect to direct peers
        this._directPeerInitial = setTimeout(() => {
            this.direct.forEach(id => {
                this._connect(id);
            });
        }, constants.GossipsubDirectConnectInitialDelay);
    }
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop() {
        super.stop();
        this.heartbeat.stop();
        this.score.stop();
        this.mesh = new Map();
        this.fanout = new Map();
        this.lastpub = new Map();
        this.gossip = new Map();
        this.control = new Map();
        this.peerhave = new Map();
        this.iasked = new Map();
        this.backoff = new Map();
        this.outbound = new Map();
        this.gossipTracer.clear();
        clearTimeout(this._directPeerInitial);
    }
    /**
     * Connect to a peer using the gossipsub protocol
     * @param {string} id
     * @returns {void}
     */
    _connect(id) {
        this.log('Initiating connection with %s', id);
        this._libp2p.dialProtocol(PeerId.createFromB58String(id), this.multicodecs);
    }
    /**
     * Subscribes to a topic
     * @override
     * @param {string} topic
     * @returns {void}
     */
    subscribe(topic) {
        super.subscribe(topic);
        this.join(topic);
    }
    /**
     * Unsubscribe to a topic
     * @override
     * @param {string} topic
     * @returns {void}
     */
    unsubscribe(topic) {
        super.unsubscribe(topic);
        this.leave(topic);
    }
    /**
     * Join topic
     * @param {string} topic
     * @returns {void}
     */
    join(topic) {
        if (!this.started) {
            throw new Error('Gossipsub has not started');
        }
        this.log('JOIN %s', topic);
        const fanoutPeers = this.fanout.get(topic);
        if (fanoutPeers) {
            // these peers have a score above the publish threshold, which may be negative
            // so drop the ones with a negative score
            fanoutPeers.forEach(id => {
                if (this.score.score(id) < 0) {
                    fanoutPeers.delete(id);
                }
            });
            if (fanoutPeers.size < this._options.D) {
                // we need more peers; eager, as this would get fixed in the next heartbeat
                get_gossip_peers_1.getGossipPeers(this, topic, this._options.D - fanoutPeers.size, (id) => {
                    // filter our current peers, direct peers, and peers with negative scores
                    return !fanoutPeers.has(id) && !this.direct.has(id) && this.score.score(id) >= 0;
                }).forEach(id => fanoutPeers.add(id));
            }
            this.mesh.set(topic, fanoutPeers);
            this.fanout.delete(topic);
            this.lastpub.delete(topic);
        }
        else {
            const peers = get_gossip_peers_1.getGossipPeers(this, topic, this._options.D, (id) => {
                // filter direct peers and peers with negative score
                return !this.direct.has(id) && this.score.score(id) >= 0;
            });
            this.mesh.set(topic, peers);
        }
        this.mesh.get(topic).forEach((id) => {
            this.log('JOIN: Add mesh link to %s in %s', id, topic);
            this._sendGraft(id, topic);
        });
    }
    /**
     * Leave topic
     * @param {string} topic
     * @returns {void}
     */
    leave(topic) {
        if (!this.started) {
            throw new Error('Gossipsub has not started');
        }
        this.log('LEAVE %s', topic);
        // Send PRUNE to mesh peers
        const meshPeers = this.mesh.get(topic);
        if (meshPeers) {
            meshPeers.forEach((id) => {
                this.log('LEAVE: Remove mesh link to %s in %s', id, topic);
                this._sendPrune(id, topic);
            });
            this.mesh.delete(topic);
        }
    }
    /**
     * Publish messages
     *
     * @override
     * @param {InMessage} msg
     * @returns {void}
     */
    _publish(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.receivedFrom !== this.peerId.toB58String()) {
                this.score.deliverMessage(msg);
                this.gossipTracer.deliverMessage(msg);
            }
            const msgID = this.getMsgId(msg);
            const msgIdStr = utils_1.messageIdToString(msgID);
            // put in seen cache
            this.seenCache.put(msgIdStr);
            this.messageCache.put(msg);
            const tosend = new Set();
            msg.topicIDs.forEach((topic) => {
                const peersInTopic = this.topics.get(topic);
                if (!peersInTopic) {
                    return;
                }
                if (this._options.floodPublish && msg.from === this.peerId.toB58String()) {
                    // flood-publish behavior
                    // send to direct peers and _all_ peers meeting the publishThreshold
                    peersInTopic.forEach(id => {
                        if (this.direct.has(id) || this.score.score(id) >= this._options.scoreThresholds.publishThreshold) {
                            tosend.add(id);
                        }
                    });
                }
                else {
                    // non-flood-publish behavior
                    // send to direct peers, subscribed floodsub peers
                    // and some mesh peers above publishThreshold
                    // direct peers
                    this.direct.forEach(id => {
                        tosend.add(id);
                    });
                    // floodsub peers
                    peersInTopic.forEach((id) => {
                        const score = this.score.score(id);
                        const peerStreams = this.peers.get(id);
                        if (!peerStreams) {
                            return;
                        }
                        if (peerStreams.protocol === constants.FloodsubID && score >= this._options.scoreThresholds.publishThreshold) {
                            tosend.add(id);
                        }
                    });
                    // Gossipsub peers handling
                    let meshPeers = this.mesh.get(topic);
                    if (!meshPeers || !meshPeers.size) {
                        // We are not in the mesh for topic, use fanout peers
                        meshPeers = this.fanout.get(topic);
                        if (!meshPeers) {
                            // If we are not in the fanout, then pick peers in topic above the publishThreshold
                            const peers = get_gossip_peers_1.getGossipPeers(this, topic, this._options.D, id => {
                                return this.score.score(id) >= this._options.scoreThresholds.publishThreshold;
                            });
                            if (peers.size > 0) {
                                meshPeers = peers;
                                this.fanout.set(topic, peers);
                            }
                            else {
                                meshPeers = new Set();
                            }
                        }
                        // Store the latest publishing time
                        this.lastpub.set(topic, this._now());
                    }
                    meshPeers.forEach((peer) => {
                        tosend.add(peer);
                    });
                }
            });
            // Publish messages to peers
            const rpc = utils_1.createGossipRpc([
                pubsub_1.utils.normalizeOutRpcMessage(msg)
            ]);
            tosend.forEach((id) => {
                if (id === msg.from) {
                    return;
                }
                this._sendRpc(id, rpc);
            });
        });
    }
    /**
     * Sends a GRAFT message to a peer
     * @param {string} id peer id
     * @param {string} topic
     * @returns {void}
     */
    _sendGraft(id, topic) {
        const graft = [{
                topicID: topic
            }];
        const out = utils_1.createGossipRpc([], { graft });
        this._sendRpc(id, out);
    }
    /**
     * Sends a PRUNE message to a peer
     * @param {string} id peer id
     * @param {string} topic
     * @returns {void}
     */
    _sendPrune(id, topic) {
        const prune = [
            this._makePrune(id, topic, this._options.doPX)
        ];
        const out = utils_1.createGossipRpc([], { prune });
        this._sendRpc(id, out);
    }
    /**
     * @override
     */
    _sendRpc(id, outRpc) {
        const peerStreams = this.peers.get(id);
        if (!peerStreams || !peerStreams.isWritable) {
            return;
        }
        // piggyback control message retries
        const ctrl = this.control.get(id);
        if (ctrl) {
            this._piggybackControl(id, outRpc, ctrl);
            this.control.delete(id);
        }
        // piggyback gossip
        const ihave = this.gossip.get(id);
        if (ihave) {
            this._piggybackGossip(id, outRpc, ihave);
            this.gossip.delete(id);
        }
        peerStreams.write(message_1.RPCCodec.encode(outRpc));
    }
    _piggybackControl(id, outRpc, ctrl) {
        const tograft = (ctrl.graft || [])
            .filter(({ topicID }) => (topicID && this.mesh.get(topicID) || new Set()).has(id));
        const toprune = (ctrl.prune || [])
            .filter(({ topicID }) => !(topicID && this.mesh.get(topicID) || new Set()).has(id));
        if (!tograft.length && !toprune.length) {
            return;
        }
        if (outRpc.control) {
            outRpc.control.graft = outRpc.control.graft.concat(tograft);
            outRpc.control.prune = outRpc.control.prune.concat(toprune);
        }
        else {
            outRpc.control = { ihave: [], iwant: [], graft: tograft, prune: toprune };
        }
    }
    _piggybackGossip(id, outRpc, ihave) {
        if (!outRpc.control) {
            outRpc.control = { ihave: [], iwant: [], graft: [], prune: [] };
        }
        outRpc.control.ihave = ihave;
    }
    /**
     * Send graft and prune messages
     * @param {Map<string, Array<string>>} tograft peer id => topic[]
     * @param {Map<string, Array<string>>} toprune peer id => topic[]
     */
    _sendGraftPrune(tograft, toprune, noPX) {
        const doPX = this._options.doPX;
        for (const [id, topics] of tograft) {
            const graft = topics.map((topicID) => ({ topicID }));
            let prune = [];
            // If a peer also has prunes, process them now
            const pruning = toprune.get(id);
            if (pruning) {
                prune = pruning.map((topicID) => this._makePrune(id, topicID, doPX && !noPX.get(id)));
                toprune.delete(id);
            }
            const outRpc = utils_1.createGossipRpc([], { graft, prune });
            this._sendRpc(id, outRpc);
        }
        for (const [id, topics] of toprune) {
            const prune = topics.map((topicID) => this._makePrune(id, topicID, doPX && !noPX.get(id)));
            const outRpc = utils_1.createGossipRpc([], { prune });
            this._sendRpc(id, outRpc);
        }
    }
    /**
     * Emits gossip to peers in a particular topic
     * @param {string} topic
     * @param {Set<string>} exclude peers to exclude
     * @returns {void}
     */
    _emitGossip(topic, exclude) {
        const messageIDs = this.messageCache.getGossipIDs(topic);
        if (!messageIDs.length) {
            return;
        }
        // shuffle to emit in random order
        utils_1.shuffle(messageIDs);
        // if we are emitting more than GossipsubMaxIHaveLength ids, truncate the list
        if (messageIDs.length > constants.GossipsubMaxIHaveLength) {
            // we do the truncation (with shuffling) per peer below
            this.log('too many messages for gossip; will truncate IHAVE list (%d messages)', messageIDs.length);
        }
        // Send gossip to GossipFactor peers above threshold with a minimum of D_lazy
        // First we collect the peers above gossipThreshold that are not in the exclude set
        // and then randomly select from that set
        // We also exclude direct peers, as there is no reason to emit gossip to them
        const peersToGossip = [];
        const topicPeers = this.topics.get(topic);
        if (!topicPeers) {
            // no topic peers, no gossip
            return;
        }
        topicPeers.forEach(id => {
            const peerStreams = this.peers.get(id);
            if (!peerStreams) {
                return;
            }
            if (!exclude.has(id) &&
                !this.direct.has(id) &&
                utils_1.hasGossipProtocol(peerStreams.protocol) &&
                this.score.score(id) >= this._options.scoreThresholds.gossipThreshold) {
                peersToGossip.push(id);
            }
        });
        let target = this._options.Dlazy;
        const factor = constants.GossipsubGossipFactor * peersToGossip.length;
        if (factor > target) {
            target = factor;
        }
        if (target > peersToGossip.length) {
            target = peersToGossip.length;
        }
        else {
            utils_1.shuffle(peersToGossip);
        }
        // Emit the IHAVE gossip to the selected peers up to the target
        peersToGossip.slice(0, target).forEach(id => {
            let peerMessageIDs = messageIDs;
            if (messageIDs.length > constants.GossipsubMaxIHaveLength) {
                // shuffle and slice message IDs per peer so that we emit a different set for each peer
                // we have enough reduncancy in the system that this will significantly increase the message
                // coverage when we do truncate
                peerMessageIDs = utils_1.shuffle(peerMessageIDs.slice()).slice(0, constants.GossipsubMaxIHaveLength);
            }
            this._pushGossip(id, {
                topicID: topic,
                messageIDs: peerMessageIDs
            });
        });
    }
    /**
     * Flush gossip and control messages
     */
    _flush() {
        // send gossip first, which will also piggyback control
        for (const [peer, ihave] of this.gossip.entries()) {
            this.gossip.delete(peer);
            const out = utils_1.createGossipRpc([], { ihave });
            this._sendRpc(peer, out);
        }
        // send the remaining control messages
        for (const [peer, control] of this.control.entries()) {
            this.control.delete(peer);
            const out = utils_1.createGossipRpc([], { graft: control.graft, prune: control.prune });
            this._sendRpc(peer, out);
        }
    }
    /**
     * Adds new IHAVE messages to pending gossip
     * @param {PeerStreams} peerStreams
     * @param {Array<ControlIHave>} controlIHaveMsgs
     * @returns {void}
     */
    _pushGossip(id, controlIHaveMsgs) {
        this.log('Add gossip to %s', id);
        const gossip = this.gossip.get(id) || [];
        this.gossip.set(id, gossip.concat(controlIHaveMsgs));
    }
    /**
     * Returns the current time in milliseconds
     * @returns {number}
     */
    _now() {
        return Date.now();
    }
    /**
     * Make a PRUNE control message for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @param {boolean} doPX
     * @returns {ControlPrune}
     */
    _makePrune(id, topic, doPX) {
        if (this.peers.get(id).protocol === constants.GossipsubIDv10) {
            // Gossipsub v1.0 -- no backoff, the peer won't be able to parse it anyway
            return {
                topicID: topic,
                peers: []
            };
        }
        // backoff is measured in seconds
        // GossipsubPruneBackoff is measured in milliseconds
        const backoff = constants.GossipsubPruneBackoff / 1000;
        const px = [];
        if (doPX) {
            // select peers for Peer eXchange
            const peers = get_gossip_peers_1.getGossipPeers(this, topic, constants.GossipsubPrunePeers, (xid) => {
                return xid !== id && this.score.score(xid) >= 0;
            });
            peers.forEach(p => {
                // see if we have a signed record to send back; if we don't, just send
                // the peer ID and let the pruned peer find them in the DHT -- we can't trust
                // unsigned address records through PX anyways
                // Finding signed records in the DHT is not supported at the time of writing in js-libp2p
                const peerId = PeerId.createFromB58String(p);
                px.push({
                    peerID: peerId.toBytes(),
                    signedPeerRecord: this._libp2p.peerStore.addressBook.getRawEnvelope(peerId)
                });
            });
        }
        return {
            topicID: topic,
            peers: px,
            backoff: backoff
        };
    }
}
Gossipsub.multicodec = constants.GossipsubIDv11;
module.exports = Gossipsub;
