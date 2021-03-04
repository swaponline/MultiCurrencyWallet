import { RPC, Message, ControlMessage } from '../message';
/**
 * Create a gossipsub RPC object
 * @param {Array<RPC.Message>} msgs
 * @param {Partial<RPC.ControlMessage>} control
 * @returns {RPC}
 */
export declare function createGossipRpc(msgs?: Message[], control?: Partial<ControlMessage>): RPC;
