'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGossipRpc = void 0;
/**
 * Create a gossipsub RPC object
 * @param {Array<RPC.Message>} msgs
 * @param {Partial<RPC.ControlMessage>} control
 * @returns {RPC}
 */
function createGossipRpc(msgs = [], control = {}) {
    return {
        subscriptions: [],
        msgs: msgs,
        control: Object.assign({ ihave: [], iwant: [], graft: [], prune: [] }, control)
    };
}
exports.createGossipRpc = createGossipRpc;
