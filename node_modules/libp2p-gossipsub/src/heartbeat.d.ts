/// <reference types="node" />
import Gossipsub = require('./index');
export declare class Heartbeat {
    gossipsub: Gossipsub;
    _heartbeatTimer: {
        _intervalId: NodeJS.Timeout | undefined;
        runPeriodically(fn: () => void, period: number): void;
        cancel(): void;
    } | null;
    /**
     * @param {Object} gossipsub
     * @constructor
     */
    constructor(gossipsub: Gossipsub);
    start(): void;
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop(): void;
    /**
     * Maintains the mesh and fanout maps in gossipsub.
     *
     * @returns {void}
     */
    _heartbeat(): void;
}
