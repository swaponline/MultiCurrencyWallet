"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailedIKError = void 0;
class FailedIKError extends Error {
    constructor(initialMsg, message) {
        super(message);
        this.initialMsg = initialMsg;
        this.name = 'FailedIKhandshake';
    }
}
exports.FailedIKError = FailedIKError;
//# sourceMappingURL=errors.js.map