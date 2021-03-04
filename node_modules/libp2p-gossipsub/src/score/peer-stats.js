"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTopicStats = exports.createTopicStats = exports.createPeerStats = void 0;
function createPeerStats(ps = {}) {
    return Object.assign(Object.assign({ connected: false, expire: 0, ips: [], behaviourPenalty: 0 }, ps), { topics: ps.topics
            ? Object.entries(ps.topics)
                .reduce((topics, [topic, topicStats]) => {
                topics[topic] = createTopicStats(topicStats);
                return topics;
            }, {})
            : {} });
}
exports.createPeerStats = createPeerStats;
function createTopicStats(ts = {}) {
    return Object.assign({ inMesh: false, graftTime: 0, meshTime: 0, firstMessageDeliveries: 0, meshMessageDeliveries: 0, meshMessageDeliveriesActive: false, meshFailurePenalty: 0, invalidMessageDeliveries: 0 }, ts);
}
exports.createTopicStats = createTopicStats;
function ensureTopicStats(topic, ps, params) {
    let ts = ps.topics[topic];
    if (ts) {
        return ts;
    }
    if (!params.topics[topic]) {
        return undefined;
    }
    ps.topics[topic] = ts = createTopicStats();
    return ts;
}
exports.ensureTopicStats = ensureTopicStats;
