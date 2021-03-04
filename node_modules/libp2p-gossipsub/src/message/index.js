"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCCodec = void 0;
const rpc_proto_1 = __importDefault(require("./rpc.proto"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const protons = require("protons");
const rpcProto = protons(rpc_proto_1.default);
exports.RPCCodec = rpcProto.RPC;
