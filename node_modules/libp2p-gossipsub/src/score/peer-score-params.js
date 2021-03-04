"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTopicScoreParams = exports.validatePeerScoreParams = exports.createTopicScoreParams = exports.createPeerScoreParams = exports.defaultTopicScoreParams = exports.defaultPeerScoreParams = void 0;
const constants_1 = require("./constants");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const errcode = require("err-code");
exports.defaultPeerScoreParams = {
    topics: {},
    topicScoreCap: 10,
    appSpecificScore: () => 0,
    appSpecificWeight: 10,
    IPColocationFactorWeight: -5,
    IPColocationFactorThreshold: 10,
    IPColocationFactorWhitelist: new Set(),
    behaviourPenaltyWeight: -10,
    behaviourPenaltyDecay: 0.2,
    decayInterval: 1000,
    decayToZero: 0.1,
    retainScore: 3600 * 1000
};
exports.defaultTopicScoreParams = {
    topicWeight: 0.5,
    timeInMeshWeight: 1,
    timeInMeshQuantum: 1,
    timeInMeshCap: 3600,
    firstMessageDeliveriesWeight: 1,
    firstMessageDeliveriesDecay: 0.5,
    firstMessageDeliveriesCap: 2000,
    meshMessageDeliveriesWeight: -1,
    meshMessageDeliveriesDecay: 0.5,
    meshMessageDeliveriesCap: 100,
    meshMessageDeliveriesThreshold: 20,
    meshMessageDeliveriesWindow: 10,
    meshMessageDeliveriesActivation: 5000,
    meshFailurePenaltyWeight: -1,
    meshFailurePenaltyDecay: 0.5,
    invalidMessageDeliveriesWeight: -1,
    invalidMessageDeliveriesDecay: 0.3
};
function createPeerScoreParams(p = {}) {
    return Object.assign(Object.assign(Object.assign({}, exports.defaultPeerScoreParams), p), { topics: p.topics
            ? Object.entries(p.topics)
                .reduce((topics, [topic, topicScoreParams]) => {
                topics[topic] = createTopicScoreParams(topicScoreParams);
                return topics;
            }, {})
            : {} });
}
exports.createPeerScoreParams = createPeerScoreParams;
function createTopicScoreParams(p = {}) {
    return Object.assign(Object.assign({}, exports.defaultTopicScoreParams), p);
}
exports.createTopicScoreParams = createTopicScoreParams;
// peer score parameter validation
function validatePeerScoreParams(p) {
    for (const [topic, params] of Object.entries(p.topics)) {
        try {
            validateTopicScoreParams(params);
        }
        catch (e) {
            throw errcode(new Error(`invalid score parameters for topic ${topic}: ${e.message}`), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
        }
    }
    // check that the topic score is 0 or something positive
    if (p.topicScoreCap < 0) {
        throw errcode(new Error('invalid topic score cap; must be positive (or 0 for no cap)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check that we have an app specific score; the weight can be anything (but expected positive)
    if (p.appSpecificScore === null || p.appSpecificScore === undefined) {
        throw errcode(new Error('missing application specific score function'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check the IP colocation factor
    if (p.IPColocationFactorWeight > 0) {
        throw errcode(new Error('invalid IPColocationFactorWeight; must be negative (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.IPColocationFactorWeight !== 0 && p.IPColocationFactorThreshold < 1) {
        throw errcode(new Error('invalid IPColocationFactorThreshold; must be at least 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check the behaviour penalty
    if (p.behaviourPenaltyWeight > 0) {
        throw errcode(new Error('invalid BehaviourPenaltyWeight; must be negative (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.behaviourPenaltyWeight !== 0 && (p.behaviourPenaltyDecay <= 0 || p.behaviourPenaltyDecay >= 1)) {
        throw errcode(new Error('invalid BehaviourPenaltyDecay; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check the decay parameters
    if (p.decayInterval < 1000) {
        throw errcode(new Error('invalid DecayInterval; must be at least 1s'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.decayToZero <= 0 || p.decayToZero >= 1) {
        throw errcode(new Error('invalid DecayToZero; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // no need to check the score retention; a value of 0 means that we don't retain scores
}
exports.validatePeerScoreParams = validatePeerScoreParams;
function validateTopicScoreParams(p) {
    // make sure we have a sane topic weight
    if (p.topicWeight < 0) {
        throw errcode(new Error('invalid topic weight; must be >= 0'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check P1
    if (p.timeInMeshQuantum === 0) {
        throw errcode(new Error('invalid TimeInMeshQuantum; must be non zero'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.timeInMeshWeight < 0) {
        throw errcode(new Error('invalid TimeInMeshWeight; must be positive (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.timeInMeshWeight !== 0 && p.timeInMeshQuantum <= 0) {
        throw errcode(new Error('invalid TimeInMeshQuantum; must be positive'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.timeInMeshWeight !== 0 && p.timeInMeshCap <= 0) {
        throw errcode(new Error('invalid TimeInMeshCap; must be positive'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check P2
    if (p.firstMessageDeliveriesWeight < 0) {
        throw errcode(new Error('invallid FirstMessageDeliveriesWeight; must be positive (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.firstMessageDeliveriesWeight !== 0 && (p.firstMessageDeliveriesDecay <= 0 || p.firstMessageDeliveriesDecay >= 1)) {
        throw errcode(new Error('invalid FirstMessageDeliveriesDecay; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.firstMessageDeliveriesWeight !== 0 && p.firstMessageDeliveriesCap <= 0) {
        throw errcode(new Error('invalid FirstMessageDeliveriesCap; must be positive'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check P3
    if (p.meshMessageDeliveriesWeight > 0) {
        throw errcode(new Error('invalid MeshMessageDeliveriesWeight; must be negative (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshMessageDeliveriesWeight !== 0 && (p.meshMessageDeliveriesDecay <= 0 || p.meshMessageDeliveriesDecay >= 1)) {
        throw errcode(new Error('invalid MeshMessageDeliveriesDecay; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshMessageDeliveriesWeight !== 0 && p.meshMessageDeliveriesCap <= 0) {
        throw errcode(new Error('invalid MeshMessageDeliveriesCap; must be positive'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshMessageDeliveriesWeight !== 0 && p.meshMessageDeliveriesThreshold <= 0) {
        throw errcode(new Error('invalid MeshMessageDeliveriesThreshold; must be positive'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshMessageDeliveriesWindow < 0) {
        throw errcode(new Error('invalid MeshMessageDeliveriesWindow; must be non-negative'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshMessageDeliveriesWeight !== 0 && p.meshMessageDeliveriesActivation < 1000) {
        throw errcode(new Error('invalid MeshMessageDeliveriesActivation; must be at least 1s'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check P3b
    if (p.meshFailurePenaltyWeight > 0) {
        throw errcode(new Error('invalid MeshFailurePenaltyWeight; must be negative (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.meshFailurePenaltyWeight !== 0 && (p.meshFailurePenaltyDecay <= 0 || p.meshFailurePenaltyDecay >= 1)) {
        throw errcode(new Error('invalid MeshFailurePenaltyDecay; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    // check P4
    if (p.invalidMessageDeliveriesWeight > 0) {
        throw errcode(new Error('invalid InvalidMessageDeliveriesWeight; must be negative (or 0 to disable)'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
    if (p.invalidMessageDeliveriesDecay <= 0 || p.invalidMessageDeliveriesDecay >= 1) {
        throw errcode(new Error('invalid InvalidMessageDeliveriesDecay; must be between 0 and 1'), constants_1.ERR_INVALID_PEER_SCORE_PARAMS);
    }
}
exports.validateTopicScoreParams = validateTopicScoreParams;
