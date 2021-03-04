/**
 * ScoreParameterDecay computes the decay factor for a parameter, assuming the DecayInterval is 1s
 * and that the value decays to zero if it drops below 0.01
 */
export declare function scoreParameterDecay(decay: number): number;
/**
 * ScoreParameterDecay computes the decay factor for a parameter using base as the DecayInterval
 */
export declare function scoreParameterDecayWithBase(decay: number, base: number, decayToZero: number): number;
