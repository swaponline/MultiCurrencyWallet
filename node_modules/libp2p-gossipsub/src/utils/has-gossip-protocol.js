"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasGossipProtocol = void 0;
const constants_1 = require("../constants");
function hasGossipProtocol(protocol) {
    return (protocol === constants_1.GossipsubIDv10 || protocol === constants_1.GossipsubIDv11);
}
exports.hasGossipProtocol = hasGossipProtocol;
