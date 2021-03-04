/// <reference types="node" />
import Pubsub, { InMessage } from 'libp2p-interfaces/src/pubsub';
import { MessageCache } from './message-cache';
import { RPC, Message, ControlMessage, ControlIHave, ControlGraft, ControlIWant, ControlPrune, PeerInfo } from './message';
import { Heartbeat } from './heartbeat';
import { PeerScore, PeerScoreParams, PeerScoreThresholds } from './score';
import { IWantTracer } from './tracer';
import { AddrInfo, MessageIdFunction } from './interfaces';
import { Debugger } from 'debug';
import Libp2p from 'libp2p';
import PeerStreams from 'libp2p-interfaces/src/pubsub/peer-streams';
import TimeCache = require('time-cache');
import PeerId = require('peer-id');
interface GossipInputOptions {
    emitSelf: boolean;
    canRelayMessage: boolean;
    gossipIncoming: boolean;
    fallbackToFloodsub: boolean;
    floodPublish: boolean;
    doPX: boolean;
    msgIdFn: MessageIdFunction;
    messageCache: MessageCache;
    globalSignaturePolicy: 'StrictSign' | 'StrictNoSign' | undefined;
    scoreParams: Partial<PeerScoreParams>;
    scoreThresholds: Partial<PeerScoreThresholds>;
    directPeers: AddrInfo[];
    /**
     * D sets the optimal degree for a Gossipsub topic mesh.
     */
    D: number;
    /**
     * Dlo sets the lower bound on the number of peers we keep in a Gossipsub topic mesh.
     */
    Dlo: number;
    /**
     * Dhi sets the upper bound on the number of peers we keep in a Gossipsub topic mesh.
     */
    Dhi: number;
    /**
     * Dscore affects how peers are selected when pruning a mesh due to over subscription.
     */
    Dscore: number;
    /**
     * Dout sets the quota for the number of outbound connections to maintain in a topic mesh.
     */
    Dout: number;
    /**
     * Dlazy affects how many peers we will emit gossip to at each heartbeat.
     */
    Dlazy: number;
}
interface GossipOptions extends GossipInputOptions {
    scoreParams: PeerScoreParams;
    scoreThresholds: PeerScoreThresholds;
}
declare class Gossipsub extends Pubsub {
    peers: Map<string, PeerStreams>;
    direct: Set<string>;
    seenCache: TimeCache;
    topics: Map<string, Set<string>>;
    mesh: Map<string, Set<string>>;
    fanout: Map<string, Set<string>>;
    lastpub: Map<string, number>;
    gossip: Map<string, ControlIHave[]>;
    control: Map<string, ControlMessage>;
    peerhave: Map<string, number>;
    iasked: Map<string, number>;
    backoff: Map<string, Map<string, number>>;
    outbound: Map<string, boolean>;
    defaultMsgIdFn: MessageIdFunction;
    _msgIdFn: MessageIdFunction;
    messageCache: MessageCache;
    score: PeerScore;
    heartbeat: Heartbeat;
    heartbeatTicks: number;
    gossipTracer: IWantTracer;
    multicodecs: string[];
    started: boolean;
    peerId: PeerId;
    subscriptions: Set<string>;
    _libp2p: Libp2p;
    _options: GossipOptions;
    _directPeerInitial: NodeJS.Timeout;
    log: Debugger;
    emit: (event: string | symbol, ...args: any[]) => boolean;
    static multicodec: string;
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
    constructor(libp2p: Libp2p, options?: Partial<GossipInputOptions>);
    /**
     * Decode a Uint8Array into an RPC object
     * Overrided to use an extended protocol-specific protobuf decoder
     * @override
     * @param {Uint8Array} bytes
     * @returns {RPC}
     */
    _decodeRpc(bytes: Uint8Array): RPC;
    /**
     * Encode an RPC object into a Uint8Array
     * Overrided to use an extended protocol-specific protobuf encoder
     * @override
     * @param {RPC} rpc
     * @returns {Uint8Array}
     */
    _encodeRpc(rpc: RPC): Uint8Array;
    /**
     * Add a peer to the router
     * @override
     * @param {PeerId} peerId
     * @param {string} protocol
     * @returns {PeerStreams}
     */
    _addPeer(peerId: PeerId, protocol: string): PeerStreams;
    /**
     * Removes a peer from the router
     * @override
     * @param {PeerId} peer
     * @returns {PeerStreams | undefined}
     */
    _removePeer(peerId: PeerId): PeerStreams | undefined;
    /**
     * Handles an rpc request from a peer
     *
     * @override
     * @param {String} idB58Str
     * @param {PeerStreams} peerStreams
     * @param {RPC} rpc
     * @returns {boolean}
     */
    _processRpc(id: string, peerStreams: PeerStreams, rpc: RPC): boolean;
    /**
     * Handles an rpc control message from a peer
     * @param {string} id peer id
     * @param {ControlMessage} controlMsg
     * @returns {void}
     */
    _processRpcControlMessage(id: string, controlMsg: ControlMessage): void;
    /**
     * Process incoming message,
     * emitting locally and forwarding on to relevant floodsub and gossipsub peers
     * @override
     * @param {InMessage} msg
     * @returns {Promise<void>}
     */
    _processRpcMessage(msg: InMessage): Promise<void>;
    /**
     * Whether to accept a message from a peer
     * @override
     * @param {string} id
     * @returns {boolean}
     */
    _acceptFrom(id: string): boolean;
    /**
     * Validate incoming message
     * @override
     * @param {InMessage} message
     * @returns {Promise<void>}
     */
    validate(message: InMessage): Promise<void>;
    /**
     * Handles IHAVE messages
     * @param {string} id peer id
     * @param {Array<ControlIHave>} ihave
     * @returns {ControlIWant}
     */
    _handleIHave(id: string, ihave: ControlIHave[]): ControlIWant[];
    /**
     * Handles IWANT messages
     * Returns messages to send back to peer
     * @param {string} id peer id
     * @param {Array<ControlIWant>} iwant
     * @returns {Array<Message>}
     */
    _handleIWant(id: string, iwant: ControlIWant[]): Message[];
    /**
     * Handles Graft messages
     * @param {string} id peer id
     * @param {Array<ControlGraft>} graft
     * @return {Array<ControlPrune>}
     */
    _handleGraft(id: string, graft: ControlGraft[]): ControlPrune[];
    /**
     * Handles Prune messages
     * @param {string} id peer id
     * @param {Array<ControlPrune>} prune
     * @returns {void}
     */
    _handlePrune(id: string, prune: ControlPrune[]): void;
    /**
     * Add standard backoff log for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @returns {void}
     */
    _addBackoff(id: string, topic: string): void;
    /**
     * Add backoff expiry interval for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @param {number} interval backoff duration in milliseconds
     * @returns {void}
     */
    _doAddBackoff(id: string, topic: string, interval: number): void;
    /**
     * Apply penalties from broken IHAVE/IWANT promises
     * @returns {void}
     */
    _applyIwantPenalties(): void;
    /**
     * Clear expired backoff expiries
     * @returns {void}
     */
    _clearBackoff(): void;
    /**
     * Maybe reconnect to direct peers
     * @returns {void}
     */
    _directConnect(): void;
    /**
     * Maybe attempt connection given signed peer records
     * @param {PeerInfo[]} peers
     * @returns {Promise<void>}
     */
    _pxConnect(peers: PeerInfo[]): Promise<void>;
    /**
     * Mounts the gossipsub protocol onto the libp2p node and sends our
     * our subscriptions to every peer connected
     * @override
     * @returns {void}
     */
    start(): void;
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop(): void;
    /**
     * Connect to a peer using the gossipsub protocol
     * @param {string} id
     * @returns {void}
     */
    _connect(id: string): void;
    /**
     * Subscribes to a topic
     * @override
     * @param {string} topic
     * @returns {void}
     */
    subscribe(topic: string): void;
    /**
     * Unsubscribe to a topic
     * @override
     * @param {string} topic
     * @returns {void}
     */
    unsubscribe(topic: string): void;
    /**
     * Join topic
     * @param {string} topic
     * @returns {void}
     */
    join(topic: string): void;
    /**
     * Leave topic
     * @param {string} topic
     * @returns {void}
     */
    leave(topic: string): void;
    /**
     * Publish messages
     *
     * @override
     * @param {InMessage} msg
     * @returns {void}
     */
    _publish(msg: InMessage): Promise<void>;
    /**
     * Sends a GRAFT message to a peer
     * @param {string} id peer id
     * @param {string} topic
     * @returns {void}
     */
    _sendGraft(id: string, topic: string): void;
    /**
     * Sends a PRUNE message to a peer
     * @param {string} id peer id
     * @param {string} topic
     * @returns {void}
     */
    _sendPrune(id: string, topic: string): void;
    /**
     * @override
     */
    _sendRpc(id: string, outRpc: RPC): void;
    _piggybackControl(id: string, outRpc: RPC, ctrl: ControlMessage): void;
    _piggybackGossip(id: string, outRpc: RPC, ihave: ControlIHave[]): void;
    /**
     * Send graft and prune messages
     * @param {Map<string, Array<string>>} tograft peer id => topic[]
     * @param {Map<string, Array<string>>} toprune peer id => topic[]
     */
    _sendGraftPrune(tograft: Map<string, string[]>, toprune: Map<string, string[]>, noPX: Map<string, boolean>): void;
    /**
     * Emits gossip to peers in a particular topic
     * @param {string} topic
     * @param {Set<string>} exclude peers to exclude
     * @returns {void}
     */
    _emitGossip(topic: string, exclude: Set<string>): void;
    /**
     * Flush gossip and control messages
     */
    _flush(): void;
    /**
     * Adds new IHAVE messages to pending gossip
     * @param {PeerStreams} peerStreams
     * @param {Array<ControlIHave>} controlIHaveMsgs
     * @returns {void}
     */
    _pushGossip(id: string, controlIHaveMsgs: ControlIHave): void;
    /**
     * Returns the current time in milliseconds
     * @returns {number}
     */
    _now(): number;
    /**
     * Make a PRUNE control message for a peer in a topic
     * @param {string} id
     * @param {string} topic
     * @param {boolean} doPX
     * @returns {ControlPrune}
     */
    _makePrune(id: string, topic: string, doPX: boolean): ControlPrune;
}
export = Gossipsub;
