export = Topology;
/**
 * @typedef {import('peer-id')} PeerId
 */
/**
 * @typedef {Object} Options
 * @property {number} [min=0] - minimum needed connections.
 * @property {number} [max=Infinity] - maximum needed connections.
 * @property {Handlers} [handlers]
 *
 * @typedef {Object} Handlers
 * @property {(peerId: PeerId, conn: Connection) => void} [onConnect] - protocol "onConnect" handler
 * @property {(peerId: PeerId, error?:Error) => void} [onDisconnect] - protocol "onDisconnect" handler
 *
 * @typedef {import('../connection/connection')} Connection
 */
declare class Topology {
    /**
     * Checks if the given value is a Topology instance.
     *
     * @param {any} other
     * @returns {other is Topology}
     */
    static isTopology(other: any): other is Topology;
    /**
     * @param {Options} options
     */
    constructor({ min, max, handlers }: Options);
    min: number;
    max: number;
    _onConnect: (peerId: PeerId, conn: Connection) => void;
    _onDisconnect: (peerId: PeerId, error?: Error | undefined) => void;
    /**
     * Set of peers that support the protocol.
     *
     * @type {Set<string>}
     */
    peers: Set<string>;
    get [Symbol.toStringTag](): string;
    set registrar(arg: any);
    _registrar: any;
    /**
     * Notify about peer disconnected event.
     *
     * @param {PeerId} peerId
     * @returns {void}
     */
    disconnect(peerId: PeerId): void;
}
declare namespace Topology {
    export { PeerId, Options, Handlers, Connection };
}
type PeerId = import("peer-id");
type Connection = import("../connection/connection");
type Options = {
    /**
     * - minimum needed connections.
     */
    min?: number | undefined;
    /**
     * - maximum needed connections.
     */
    max?: number | undefined;
    handlers?: Handlers | undefined;
};
type Handlers = {
    /**
     * - protocol "onConnect" handler
     */
    onConnect?: ((peerId: PeerId, conn: Connection) => void) | undefined;
    /**
     * - protocol "onDisconnect" handler
     */
    onDisconnect?: ((peerId: PeerId, error?: Error | undefined) => void) | undefined;
};
//# sourceMappingURL=index.d.ts.map