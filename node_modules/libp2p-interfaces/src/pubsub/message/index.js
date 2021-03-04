'use strict'

const protons = require('protons')

const rpcProto = protons(require('./rpc.proto.js'))
const RPC = rpcProto.RPC
const topicDescriptorProto = protons(require('./topic-descriptor.proto.js'))

/**
 * @module pubsub/message/index
 */
exports = module.exports
exports.rpc = rpcProto
exports.td = topicDescriptorProto
exports.RPC = RPC
exports.Message = RPC.Message
exports.SubOpts = RPC.SubOpts
