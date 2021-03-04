import { PeerStats } from './peer-stats';
import { PeerScoreParams } from './peer-score-params';
export declare function computeScore(peer: string, pstats: PeerStats, params: PeerScoreParams, peerIPs: Map<string, Set<string>>): number;
