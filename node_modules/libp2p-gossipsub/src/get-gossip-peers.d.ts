import Gossipsub = require('./index');
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
export declare function getGossipPeers(router: Gossipsub, topic: string, count: number, filter?: (id: string) => boolean): Set<string>;
