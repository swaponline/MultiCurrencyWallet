"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCipherState = exports.logRemoteEphemeralKey = exports.logRemoteStaticKey = exports.logLocalEphemeralKeys = exports.logLocalStaticKeys = exports.logger = void 0;
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("./constants");
exports.logger = debug_1.default('libp2p:noise');
let keyLogger;
if (constants_1.DUMP_SESSION_KEYS) {
    keyLogger = exports.logger;
}
else {
    keyLogger = () => { };
}
function logLocalStaticKeys(s) {
    keyLogger(`LOCAL_STATIC_PUBLIC_KEY ${s.publicKey.toString('hex')}`);
    keyLogger(`LOCAL_STATIC_PRIVATE_KEY ${s.privateKey.toString('hex')}`);
}
exports.logLocalStaticKeys = logLocalStaticKeys;
function logLocalEphemeralKeys(e) {
    if (e) {
        keyLogger(`LOCAL_PUBLIC_EPHEMERAL_KEY ${e.publicKey.toString('hex')}`);
        keyLogger(`LOCAL_PRIVATE_EPHEMERAL_KEY ${e.privateKey.toString('hex')}`);
    }
    else {
        keyLogger('Missing local ephemeral keys.');
    }
}
exports.logLocalEphemeralKeys = logLocalEphemeralKeys;
function logRemoteStaticKey(rs) {
    keyLogger(`REMOTE_STATIC_PUBLIC_KEY ${rs.toString('hex')}`);
}
exports.logRemoteStaticKey = logRemoteStaticKey;
function logRemoteEphemeralKey(re) {
    keyLogger(`REMOTE_EPHEMERAL_PUBLIC_KEY ${re.toString('hex')}`);
}
exports.logRemoteEphemeralKey = logRemoteEphemeralKey;
function logCipherState(session) {
    if (session.cs1 && session.cs2) {
        keyLogger(`CIPHER_STATE_1 ${session.cs1.n} ${session.cs1.k.toString('hex')}`);
        keyLogger(`CIPHER_STATE_2 ${session.cs2.n} ${session.cs2.k.toString('hex')}`);
    }
    else {
        keyLogger('Missing cipher state.');
    }
}
exports.logCipherState = logCipherState;
//# sourceMappingURL=logger.js.map