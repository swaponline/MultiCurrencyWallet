export = MulticodecTopology;
declare const MulticodecTopology_base: typeof import(".");
declare class MulticodecTopology extends MulticodecTopology_base {
    /**
     * Checks if the given value is a `MulticodecTopology` instance.
     *
     * @param {any} other
     * @returns {other is MulticodecTopology}
     */
    static isMulticodecTopology(other: any): other is MulticodecTopology;
    /**
     * @param {TopologyOptions & MulticodecOptions} props
     */
    constructor({ min, max, multicodecs, handlers }: TopologyOptions & MulticodecOptions);
    multicodecs: string[];
    /**
     * Check if a new peer support the multicodecs for this topology.
     *
     * @param {Object} props
     * @param {PeerId} props.peerId
     * @param {Array<string>} props.protocols
     */
    _onProtocolChange({ peerId, protocols }: {
        peerId: PeerId;
        protocols: Array<string>;
    }): void;
    /**
     * Verify if a new connected peer has a topology multicodec and call _onConnect.
     *
     * @param {Connection} connection
     * @returns {void}
     */
    _onPeerConnect(connection: Connection): void;
    /**
     * Update topology.
     *
     * @param {Array<{id: PeerId, multiaddrs: Array<Multiaddr>, protocols: Array<string>}>} peerDataIterable
     * @returns {void}
     */
    _updatePeers(peerDataIterable: Array<{
        id: PeerId;
        multiaddrs: Array<Multiaddr>;
        protocols: Array<string>;
    }>): void;
}
declare namespace MulticodecTopology {
    export { PeerId, Multiaddr, Connection, TopologyOptions, MulticodecOptions, Handlers };
}
type PeerId = import("peer-id");
type Connection = import("../connection/connection");
type Multiaddr = import("multiaddr");
type TopologyOptions = {
    /**
     * - minimum needed connections.
     */
    min?: number | undefined;
    /**
     * - maximum needed connections.
     */
    max?: number | undefined;
    handlers?: import(".").Handlers | undefined;
};
type MulticodecOptions = {
    /**
     * - protocol multicodecs
     */
    multicodecs: string[];
    handlers: Required<Handlers>;
};
type Handlers = {
    /**
     * - protocol "onConnect" handler
     */
    onConnect?: ((peerId: import("peer-id"), conn: import("../connection/connection")) => void) | undefined;
    /**
     * - protocol "onDisconnect" handler
     */
    onDisconnect?: ((peerId: import("peer-id"), error?: Error | undefined) => void) | undefined;
};
//# sourceMappingURL=multicodec-topology.d.ts.map