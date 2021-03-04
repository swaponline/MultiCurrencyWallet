"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreParameterDecayWithBase = exports.scoreParameterDecay = void 0;
const DefaultDecayInterval = 1000;
const DefaultDecayToZero = 0.01;
/**
 * ScoreParameterDecay computes the decay factor for a parameter, assuming the DecayInterval is 1s
 * and that the value decays to zero if it drops below 0.01
 */
function scoreParameterDecay(decay) {
    return scoreParameterDecayWithBase(decay, DefaultDecayInterval, DefaultDecayToZero);
}
exports.scoreParameterDecay = scoreParameterDecay;
/**
 * ScoreParameterDecay computes the decay factor for a parameter using base as the DecayInterval
 */
function scoreParameterDecayWithBase(decay, base, decayToZero) {
    // the decay is linear, so after n ticks the value is factor^n
    // so factor^n = decayToZero => factor = decayToZero^(1/n)
    const ticks = decay / base;
    return Math.pow(decayToZero, (1 / ticks));
}
exports.scoreParameterDecayWithBase = scoreParameterDecayWithBase;
