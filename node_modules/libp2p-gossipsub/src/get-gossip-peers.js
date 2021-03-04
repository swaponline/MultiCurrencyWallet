"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGossipPeers = void 0;
const utils_1 = require("./utils");
/**
 * Given a topic, returns up to count peers subscribed to that topic
 * that pass an optional filter function
 *
 * @param {Gossipsub} router
 * @param {String} topic
 * @param {Number} count
 * @param {Function} [filter] a function to filter acceptable peers
 * @returns {Set<string>}
 *
 */
function getGossipPeers(router, topic, count, filter = () => true) {
    const peersInTopic = router.topics.get(topic);
    if (!peersInTopic) {
        return new Set();
    }
    // Adds all peers using our protocol
    // that also pass the filter function
    let peers = [];
    peersInTopic.forEach((id) => {
        const peerStreams = router.peers.get(id);
        if (!peerStreams) {
            return;
        }
        if (utils_1.hasGossipProtocol(peerStreams.protocol) &&
            filter(id)) {
            peers.push(id);
        }
    });
    // Pseudo-randomly shuffles peers
    peers = utils_1.shuffle(peers);
    if (count > 0 && peers.length > count) {
        peers = peers.slice(0, count);
    }
    return new Set(peers);
}
exports.getGossipPeers = getGossipPeers;
