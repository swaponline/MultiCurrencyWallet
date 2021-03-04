"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heartbeat = void 0;
const constants = __importStar(require("./constants"));
const get_gossip_peers_1 = require("./get-gossip-peers");
const utils_1 = require("./utils");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
class Heartbeat {
    /**
     * @param {Object} gossipsub
     * @constructor
     */
    constructor(gossipsub) {
        this.gossipsub = gossipsub;
    }
    start() {
        if (this._heartbeatTimer) {
            return;
        }
        const heartbeat = this._heartbeat.bind(this);
        const timeout = setTimeout(() => {
            heartbeat();
            this._heartbeatTimer.runPeriodically(heartbeat, constants.GossipsubHeartbeatInterval);
        }, constants.GossipsubHeartbeatInitialDelay);
        this._heartbeatTimer = {
            _intervalId: undefined,
            runPeriodically: (fn, period) => {
                this._heartbeatTimer._intervalId = setInterval(fn, period);
            },
            cancel: () => {
                clearTimeout(timeout);
                clearInterval(this._heartbeatTimer._intervalId);
            }
        };
    }
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop() {
        if (!this._heartbeatTimer) {
            return;
        }
        this._heartbeatTimer.cancel();
        this._heartbeatTimer = null;
    }
    /**
     * Maintains the mesh and fanout maps in gossipsub.
     *
     * @returns {void}
     */
    _heartbeat() {
        const { D, Dlo, Dhi, Dscore, Dout } = this.gossipsub._options;
        this.gossipsub.heartbeatTicks++;
        // cache scores throught the heartbeat
        const scores = new Map();
        const getScore = (id) => {
            let s = scores.get(id);
            if (s === undefined) {
                s = this.gossipsub.score.score(id);
                scores.set(id, s);
            }
            return s;
        };
        // peer id => topic[]
        const tograft = new Map();
        // peer id => topic[]
        const toprune = new Map();
        // peer id => don't px
        const noPX = new Map();
        // clean up expired backoffs
        this.gossipsub._clearBackoff();
        // clean up peerhave/iasked counters
        this.gossipsub.peerhave.clear();
        this.gossipsub.iasked.clear();
        // apply IWANT request penalties
        this.gossipsub._applyIwantPenalties();
        // ensure direct peers are connected
        this.gossipsub._directConnect();
        // maintain the mesh for topics we have joined
        this.gossipsub.mesh.forEach((peers, topic) => {
            // prune/graft helper functions (defined per topic)
            const prunePeer = (id) => {
                this.gossipsub.log('HEARTBEAT: Remove mesh link to %s in %s', id, topic);
                // update peer score
                this.gossipsub.score.prune(id, topic);
                // add prune backoff record
                this.gossipsub._addBackoff(id, topic);
                // remove peer from mesh
                peers.delete(id);
                // add to toprune
                const topics = toprune.get(id);
                if (!topics) {
                    toprune.set(id, [topic]);
                }
                else {
                    topics.push(topic);
                }
            };
            const graftPeer = (id) => {
                this.gossipsub.log('HEARTBEAT: Add mesh link to %s in %s', id, topic);
                // update peer score
                this.gossipsub.score.graft(id, topic);
                // add peer to mesh
                peers.add(id);
                // add to tograft
                const topics = tograft.get(id);
                if (!topics) {
                    tograft.set(id, [topic]);
                }
                else {
                    topics.push(topic);
                }
            };
            // drop all peers with negative score, without PX
            peers.forEach(id => {
                const score = getScore(id);
                if (score < 0) {
                    this.gossipsub.log('HEARTBEAT: Prune peer %s with negative score: score=%d, topic=%s', id, score, topic);
                    prunePeer(id);
                    noPX.set(id, true);
                }
            });
            // do we have enough peers?
            if (peers.size < Dlo) {
                const backoff = this.gossipsub.backoff.get(topic);
                const ineed = D - peers.size;
                const peersSet = get_gossip_peers_1.getGossipPeers(this.gossipsub, topic, ineed, id => {
                    // filter out mesh peers, direct peers, peers we are backing off, peers with negative score
                    return !peers.has(id) && !this.gossipsub.direct.has(id) && (!backoff || !backoff.has(id)) && getScore(id) >= 0;
                });
                peersSet.forEach(graftPeer);
            }
            // do we have to many peers?
            if (peers.size > Dhi) {
                let peersArray = Array.from(peers);
                // sort by score
                peersArray.sort((a, b) => getScore(b) - getScore(a));
                // We keep the first D_score peers by score and the remaining up to D randomly
                // under the constraint that we keep D_out peers in the mesh (if we have that many)
                peersArray = peersArray.slice(0, Dscore).concat(utils_1.shuffle(peersArray.slice(Dscore)));
                // count the outbound peers we are keeping
                let outbound = 0;
                peersArray.slice(0, D).forEach(p => {
                    if (this.gossipsub.outbound.get(p)) {
                        outbound++;
                    }
                });
                // if it's less than D_out, bubble up some outbound peers from the random selection
                if (outbound < Dout) {
                    const rotate = (i) => {
                        // rotate the peersArray to the right and put the ith peer in the front
                        const p = peersArray[i];
                        for (let j = i; j > 0; j--) {
                            peersArray[j] = peersArray[j - 1];
                        }
                        peersArray[0] = p;
                    };
                    // first bubble up all outbound peers already in the selection to the front
                    if (outbound > 0) {
                        let ihave = outbound;
                        for (let i = 1; i < D && ihave > 0; i++) {
                            if (this.gossipsub.outbound.get(peersArray[i])) {
                                rotate(i);
                                ihave--;
                            }
                        }
                    }
                    // now bubble up enough outbound peers outside the selection to the front
                    let ineed = D - outbound;
                    for (let i = D; i < peersArray.length && ineed > 0; i++) {
                        if (this.gossipsub.outbound.get(peersArray[i])) {
                            rotate(i);
                            ineed--;
                        }
                    }
                }
                // prune the excess peers
                peersArray.slice(D).forEach(prunePeer);
            }
            // do we have enough outbound peers?
            if (peers.size >= Dlo) {
                // count the outbound peers we have
                let outbound = 0;
                peers.forEach(p => {
                    if (this.gossipsub.outbound.get(p)) {
                        outbound++;
                    }
                });
                // if it's less than D_out, select some peers with outbound connections and graft them
                if (outbound < Dout) {
                    const ineed = Dout - outbound;
                    const backoff = this.gossipsub.backoff.get(topic);
                    get_gossip_peers_1.getGossipPeers(this.gossipsub, topic, ineed, (id) => {
                        // filter our current mesh peers, direct peers, peers we are backing off, peers with negative score
                        return !peers.has(id) && !this.gossipsub.direct.has(id) && (!backoff || !backoff.has(id)) && getScore(id) >= 0;
                    }).forEach(graftPeer);
                }
            }
            // should we try to improve the mesh with opportunistic grafting?
            if (this.gossipsub.heartbeatTicks % constants.GossipsubOpportunisticGraftTicks === 0 && peers.size > 1) {
                // Opportunistic grafting works as follows: we check the median score of peers in the
                // mesh; if this score is below the opportunisticGraftThreshold, we select a few peers at
                // random with score over the median.
                // The intention is to (slowly) improve an underperforming mesh by introducing good
                // scoring peers that may have been gossiping at us. This allows us to get out of sticky
                // situations where we are stuck with poor peers and also recover from churn of good peers.
                // now compute the median peer score in the mesh
                const peersList = Array.from(peers)
                    .sort((a, b) => getScore(a) - getScore(b));
                const medianIndex = peers.size / 2;
                const medianScore = getScore(peersList[medianIndex]);
                // if the median score is below the threshold, select a better peer (if any) and GRAFT
                if (medianScore < this.gossipsub._options.scoreThresholds.opportunisticGraftThreshold) {
                    const backoff = this.gossipsub.backoff.get(topic);
                    const peersToGraft = get_gossip_peers_1.getGossipPeers(this.gossipsub, topic, constants.GossipsubOpportunisticGraftPeers, (id) => {
                        // filter out current mesh peers, direct peers, peers we are backing off, peers below or at threshold
                        return peers.has(id) && !this.gossipsub.direct.has(id) && (!backoff || !backoff.has(id)) && getScore(id) > medianScore;
                    });
                    peersToGraft.forEach(id => {
                        this.gossipsub.log('HEARTBEAT: Opportunistically graft peer %s on topic %s', id, topic);
                        graftPeer(id);
                    });
                }
            }
            // 2nd arg are mesh peers excluded from gossip. We have already pushed
            // messages to them, so its redundant to gossip IHAVEs.
            this.gossipsub._emitGossip(topic, peers);
        });
        // expire fanout for topics we haven't published to in a while
        const now = this.gossipsub._now();
        this.gossipsub.lastpub.forEach((lastpb, topic) => {
            if ((lastpb + constants.GossipsubFanoutTTL) < now) {
                this.gossipsub.fanout.delete(topic);
                this.gossipsub.lastpub.delete(topic);
            }
        });
        // maintain our fanout for topics we are publishing but we have not joined
        this.gossipsub.fanout.forEach((fanoutPeers, topic) => {
            // checks whether our peers are still in the topic and have a score above the publish threshold
            const topicPeers = this.gossipsub.topics.get(topic);
            fanoutPeers.forEach(id => {
                if (!topicPeers.has(id) ||
                    getScore(id) < this.gossipsub._options.scoreThresholds.publishThreshold) {
                    fanoutPeers.delete(id);
                }
            });
            // do we need more peers?
            if (fanoutPeers.size < D) {
                const ineed = D - fanoutPeers.size;
                const peersSet = get_gossip_peers_1.getGossipPeers(this.gossipsub, topic, ineed, (id) => {
                    // filter out existing fanout peers, direct peers, and peers with score above the publish threshold
                    return !fanoutPeers.has(id) &&
                        !this.gossipsub.direct.has(id) &&
                        getScore(id) >= this.gossipsub._options.scoreThresholds.publishThreshold;
                });
                peersSet.forEach(id => {
                    fanoutPeers.add(id);
                });
            }
            // 2nd arg are fanout peers excluded from gossip.
            // We have already pushed messages to them, so its redundant to gossip IHAVEs
            this.gossipsub._emitGossip(topic, fanoutPeers);
        });
        // send coalesced GRAFT/PRUNE messages (will piggyback gossip)
        this.gossipsub._sendGraftPrune(tograft, toprune, noPX);
        // flush pending gossip that wasn't piggybacked above
        this.gossipsub._flush();
        // advance the message history window
        this.gossipsub.messageCache.shift();
        this.gossipsub.emit('gossipsub:heartbeat');
    }
}
exports.Heartbeat = Heartbeat;
