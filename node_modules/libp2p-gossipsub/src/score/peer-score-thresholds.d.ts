export interface PeerScoreThresholds {
    /**
     * gossipThreshold is the score threshold below which gossip propagation is supressed;
     * should be negative.
     */
    gossipThreshold: number;
    /**
     * publishThreshold is the score threshold below which we shouldn't publish when using flood
     * publishing (also applies to fanout and floodsub peers); should be negative and <= GossipThreshold.
     */
    publishThreshold: number;
    /**
     * graylistThreshold is the score threshold below which message processing is supressed altogether,
     * implementing an effective graylist according to peer score; should be negative and <= PublisThreshold.
     */
    graylistThreshold: number;
    /**
     * acceptPXThreshold is the score threshold below which PX will be ignored; this should be positive
     * and limited to scores attainable by bootstrappers and other trusted nodes.
     */
    acceptPXThreshold: number;
    /**
     * opportunisticGraftThreshold is the median mesh score threshold before triggering opportunistic
     * grafting; this should have a small positive value.
     */
    opportunisticGraftThreshold: number;
}
export declare const defaultPeerScoreThresholds: PeerScoreThresholds;
export declare function createPeerScoreThresholds(p?: Partial<PeerScoreThresholds>): PeerScoreThresholds;
export declare function validatePeerScoreThresholds(p: PeerScoreThresholds): void;
