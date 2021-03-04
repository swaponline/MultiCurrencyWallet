"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePeerScoreThresholds = exports.createPeerScoreThresholds = exports.defaultPeerScoreThresholds = void 0;
const constants_1 = require("./constants");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const errcode = require("err-code");
exports.defaultPeerScoreThresholds = {
    gossipThreshold: -10,
    publishThreshold: -50,
    graylistThreshold: -80,
    acceptPXThreshold: 10,
    opportunisticGraftThreshold: 20
};
function createPeerScoreThresholds(p = {}) {
    return Object.assign(Object.assign({}, exports.defaultPeerScoreThresholds), p);
}
exports.createPeerScoreThresholds = createPeerScoreThresholds;
function validatePeerScoreThresholds(p) {
    if (p.gossipThreshold > 0) {
        throw errcode(new Error('invalid gossip threshold; it must be <= 0'), constants_1.ERR_INVALID_PEER_SCORE_THRESHOLDS);
    }
    if (p.publishThreshold > 0 || p.publishThreshold > p.gossipThreshold) {
        throw errcode(new Error('invalid publish threshold; it must be <= 0 and <= gossip threshold'), constants_1.ERR_INVALID_PEER_SCORE_THRESHOLDS);
    }
    if (p.graylistThreshold > 0 || p.graylistThreshold > p.publishThreshold) {
        throw errcode(new Error('invalid graylist threshold; it must be <= 0 and <= publish threshold'), constants_1.ERR_INVALID_PEER_SCORE_THRESHOLDS);
    }
    if (p.acceptPXThreshold < 0) {
        throw errcode(new Error('invalid accept PX threshold; it must be >= 0'), constants_1.ERR_INVALID_PEER_SCORE_THRESHOLDS);
    }
    if (p.opportunisticGraftThreshold < 0) {
        throw errcode(new Error('invalid opportunistic grafting threshold; it must be >= 0'), constants_1.ERR_INVALID_PEER_SCORE_THRESHOLDS);
    }
}
exports.validatePeerScoreThresholds = validatePeerScoreThresholds;
