"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyCache = void 0;
/**
 * Storage for static keys of previously connected peers.
 */
class Keycache {
    constructor() {
        this.storage = new Map();
    }
    store(peerId, key) {
        this.storage.set(peerId.id, key);
    }
    load(peerId) {
        var _a;
        if (!peerId) {
            return null;
        }
        return (_a = this.storage.get(peerId.id)) !== null && _a !== void 0 ? _a : null;
    }
    resetStorage() {
        this.storage.clear();
    }
}
const KeyCache = new Keycache();
exports.KeyCache = KeyCache;
//# sourceMappingURL=keycache.js.map