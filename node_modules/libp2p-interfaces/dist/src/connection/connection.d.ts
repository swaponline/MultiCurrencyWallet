export = Connection;
/**
 * @typedef {import('../stream-muxer/types').MuxedStream} MuxedStream
 * @typedef {import('./status').Status} Status
 */
/**
 * @typedef {Object} Timeline
 * @property {number} open - connection opening timestamp.
 * @property {number} [upgraded] - connection upgraded timestamp.
 * @property {number} [close]
 *
 * @typedef {Object} ConectionStat
 * @property {string} direction - connection establishment direction ("inbound" or "outbound").
 * @property {Timeline} timeline - connection relevant events timestamp.
 * @property {string} [multiplexer] - connection multiplexing identifier.
 * @property {string} [encryption] - connection encryption method identifier.
 *
 * @typedef {Object} ConnectionOptions
 * @property {multiaddr} [localAddr] - local multiaddr of the connection if known.
 * @property {multiaddr} remoteAddr - remote multiaddr of the connection.
 * @property {PeerId} localPeer - local peer-id.
 * @property {PeerId} remotePeer - remote peer-id.
 * @property {(protocols: string|string[]) => Promise<{stream: MuxedStream, protocol: string}>} newStream - new stream muxer function.
 * @property {() => Promise<void>} close - close raw connection function.
 * @property {() => MuxedStream[]} getStreams - get streams from muxer function.
 * @property {ConectionStat} stat - metadata of the connection.
 *
 * @typedef {Object} StreamData
 * @property {string} protocol - the protocol used by the stream
 * @property {Object} [metadata] - metadata of the stream
 */
/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
declare class Connection {
    /**
     * Checks if the given value is a `Connection` instance.
     *
     * @param {any} other
     * @returns {other is Connection}
     */
    static isConnection(other: any): other is Connection;
    /**
     * An implementation of the js-libp2p connection.
     * Any libp2p transport should use an upgrader to return this connection.
     *
     * @class
     * @param {ConnectionOptions} options
     */
    constructor({ localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat }: ConnectionOptions);
    /**
     * Connection identifier.
     */
    id: string;
    /**
     * Observed multiaddr of the local peer
     */
    localAddr: import("multiaddr") | undefined;
    /**
     * Observed multiaddr of the remote peer
     */
    remoteAddr: import("multiaddr");
    /**
     * Local peer id.
     */
    localPeer: import("peer-id");
    /**
     * Remote peer id.
     */
    remotePeer: import("peer-id");
    /**
     * Connection metadata.
     *
     * @type {ConectionStat & {status: Status}}
     */
    _stat: ConectionStat & {
        status: Status;
    };
    /**
     * Reference to the new stream function of the multiplexer
     */
    _newStream: (protocols: string | string[]) => Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * Reference to the close function of the raw connection
     */
    _close: () => Promise<void>;
    /**
     * Reference to the getStreams function of the muxer
     */
    _getStreams: () => MuxedStream[];
    /**
     * Connection streams registry
     */
    registry: Map<any, any>;
    /**
     * User provided tags
     *
     * @type {string[]}
     */
    tags: string[];
    get [Symbol.toStringTag](): string;
    /**
     * Get connection metadata
     *
     * @this {Connection}
     */
    get stat(): ConectionStat & {
        status: Status;
    };
    /**
     * Get all the streams of the muxer.
     *
     * @this {Connection}
     */
    get streams(): import("../stream-muxer/types").MuxedStream[];
    /**
     * Create a new stream from this connection
     *
     * @param {string|string[]} protocols - intended protocol for the stream
     * @returns {Promise<{stream: MuxedStream, protocol: string}>} with muxed+multistream-selected stream and selected protocol
     */
    newStream(protocols: string | string[]): Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * Add a stream when it is opened to the registry.
     *
     * @param {MuxedStream} muxedStream - a muxed stream
     * @param {StreamData} data - the stream data to be registered
     * @returns {void}
     */
    addStream(muxedStream: MuxedStream, { protocol, metadata }: StreamData): void;
    /**
     * Remove stream registry after it is closed.
     *
     * @param {string} id - identifier of the stream
     */
    removeStream(id: string): void;
    /**
     * Close the connection.
     *
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    _closing: void | undefined;
}
declare namespace Connection {
    export { MuxedStream, Status, Timeline, ConectionStat, ConnectionOptions, StreamData };
}
type ConectionStat = {
    /**
     * - connection establishment direction ("inbound" or "outbound").
     */
    direction: string;
    /**
     * - connection relevant events timestamp.
     */
    timeline: Timeline;
    /**
     * - connection multiplexing identifier.
     */
    multiplexer?: string | undefined;
    /**
     * - connection encryption method identifier.
     */
    encryption?: string | undefined;
};
type Status = "open" | "closing" | "closed";
type MuxedStream = import("../stream-muxer/types").MuxedStream;
type StreamData = {
    /**
     * - the protocol used by the stream
     */
    protocol: string;
    /**
     * - metadata of the stream
     */
    metadata?: any;
};
type ConnectionOptions = {
    /**
     * - local multiaddr of the connection if known.
     */
    localAddr?: import("multiaddr") | undefined;
    /**
     * - remote multiaddr of the connection.
     */
    remoteAddr: import("multiaddr");
    /**
     * - local peer-id.
     */
    localPeer: import("peer-id");
    /**
     * - remote peer-id.
     */
    remotePeer: import("peer-id");
    /**
     * - new stream muxer function.
     */
    newStream: (protocols: string | string[]) => Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * - close raw connection function.
     */
    close: () => Promise<void>;
    /**
     * - get streams from muxer function.
     */
    getStreams: () => MuxedStream[];
    /**
     * - metadata of the connection.
     */
    stat: ConectionStat;
};
type Timeline = {
    /**
     * - connection opening timestamp.
     */
    open: number;
    /**
     * - connection upgraded timestamp.
     */
    upgraded?: number | undefined;
    close?: number | undefined;
};
//# sourceMappingURL=connection.d.ts.map