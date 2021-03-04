"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@walletconnect/utils");
class SessionStorage {
    constructor() {
        this.storageId = "walletconnect";
    }
    getSession() {
        let session = null;
        const json = utils_1.getLocal(this.storageId);
        if (json && utils_1.isWalletConnectSession(json)) {
            session = json;
        }
        return session;
    }
    setSession(session) {
        utils_1.setLocal(this.storageId, session);
        return session;
    }
    removeSession() {
        utils_1.removeLocal(this.storageId);
    }
}
exports.default = SessionStorage;
//# sourceMappingURL=storage.js.map