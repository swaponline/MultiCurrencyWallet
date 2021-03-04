export interface PeerScoreParams {
    /**
     * Score parameters per topic.
     */
    topics: Record<string, TopicScoreParams>;
    /**
     * Aggregate topic score cap; this limits the total contribution of topics towards a positive
     * score. It must be positive (or 0 for no cap).
     */
    topicScoreCap: number;
    /**
     * P5: Application-specific peer scoring
     */
    appSpecificScore: (p: string) => number;
    appSpecificWeight: number;
    /**
     * P6: IP-colocation factor.
     * The parameter has an associated counter which counts the number of peers with the same IP.
     * If the number of peers in the same IP exceeds IPColocationFactorThreshold, then the value
     * is the square of the difference, ie (PeersInSameIP - IPColocationThreshold)^2.
     * If the number of peers in the same IP is less than the threshold, then the value is 0.
     * The weight of the parameter MUST be negative, unless you want to disable for testing.
     * Note: In order to simulate many IPs in a managable manner when testing, you can set the weight to 0
     *       thus disabling the IP colocation penalty.
     */
    IPColocationFactorWeight: number;
    IPColocationFactorThreshold: number;
    IPColocationFactorWhitelist: Set<string>;
    /**
     * P7: behavioural pattern penalties.
     * This parameter has an associated counter which tracks misbehaviour as detected by the
     * router. The router currently applies penalties for the following behaviors:
     * - attempting to re-graft before the prune backoff time has elapsed.
     * - not following up in IWANT requests for messages advertised with IHAVE.
     *
     * The value of the parameter is the square of the counter, which decays with  BehaviourPenaltyDecay.
     * The weight of the parameter MUST be negative (or zero to disable).
     */
    behaviourPenaltyWeight: number;
    behaviourPenaltyDecay: number;
    /**
     * the decay interval for parameter counters.
     */
    decayInterval: number;
    /**
     * counter value below which it is considered 0.
     */
    decayToZero: number;
    /**
     * time to remember counters for a disconnected peer.
     */
    retainScore: number;
}
export interface TopicScoreParams {
    /**
     * The weight of the topic.
     */
    topicWeight: number;
    /**
     * P1: time in the mesh
     * This is the time the peer has ben grafted in the mesh.
     * The value of the parameter is the time/TimeInMeshQuantum, capped by TimeInMeshCap
     * The weight of the parameter MUST be positive (or zero to disable).
     */
    timeInMeshWeight: number;
    timeInMeshQuantum: number;
    timeInMeshCap: number;
    /**
     * P2: first message deliveries
     * This is the number of message deliveries in the topic.
     * The value of the parameter is a counter, decaying with FirstMessageDeliveriesDecay, and capped
     * by FirstMessageDeliveriesCap.
     * The weight of the parameter MUST be positive (or zero to disable).
     */
    firstMessageDeliveriesWeight: number;
    firstMessageDeliveriesDecay: number;
    firstMessageDeliveriesCap: number;
    /**
     * P3: mesh message deliveries
     * This is the number of message deliveries in the mesh, within the MeshMessageDeliveriesWindow of
     * message validation; deliveries during validation also count and are retroactively applied
     * when validation succeeds.
     * This window accounts for the minimum time before a hostile mesh peer trying to game the score
     * could replay back a valid message we just sent them.
     * It effectively tracks first and near-first deliveries, ie a message seen from a mesh peer
     * before we have forwarded it to them.
     * The parameter has an associated counter, decaying with MeshMessageDeliveriesDecay.
     * If the counter exceeds the threshold, its value is 0.
     * If the counter is below the MeshMessageDeliveriesThreshold, the value is the square of
     * the deficit, ie (MessageDeliveriesThreshold - counter)^2
     * The penalty is only activated after MeshMessageDeliveriesActivation time in the mesh.
     * The weight of the parameter MUST be negative (or zero to disable).
     */
    meshMessageDeliveriesWeight: number;
    meshMessageDeliveriesDecay: number;
    meshMessageDeliveriesCap: number;
    meshMessageDeliveriesThreshold: number;
    meshMessageDeliveriesWindow: number;
    meshMessageDeliveriesActivation: number;
    /**
     * P3b: sticky mesh propagation failures
     * This is a sticky penalty that applies when a peer gets pruned from the mesh with an active
     * mesh message delivery penalty.
     * The weight of the parameter MUST be negative (or zero to disable)
     */
    meshFailurePenaltyWeight: number;
    meshFailurePenaltyDecay: number;
    /**
     * P4: invalid messages
     * This is the number of invalid messages in the topic.
     * The value of the parameter is the square of the counter, decaying with
     * InvalidMessageDeliveriesDecay.
     * The weight of the parameter MUST be negative (or zero to disable).
     */
    invalidMessageDeliveriesWeight: number;
    invalidMessageDeliveriesDecay: number;
}
export declare const defaultPeerScoreParams: PeerScoreParams;
export declare const defaultTopicScoreParams: TopicScoreParams;
export declare function createPeerScoreParams(p?: Partial<PeerScoreParams>): PeerScoreParams;
export declare function createTopicScoreParams(p?: Partial<TopicScoreParams>): TopicScoreParams;
export declare function validatePeerScoreParams(p: PeerScoreParams): void;
export declare function validateTopicScoreParams(p: TopicScoreParams): void;
