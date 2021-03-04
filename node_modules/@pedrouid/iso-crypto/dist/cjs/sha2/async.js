"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemd160 = exports.sha512 = exports.sha256 = void 0;
const helpers_1 = require("../helpers");
function sha256(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = helpers_1.EMPTY_UINT_ARRAY;
        if (helpers_1.isBrowser()) {
            result = yield helpers_1.browserSha256(msg);
        }
        else if (helpers_1.isNode()) {
            result = helpers_1.nodeSha256(msg);
        }
        else {
            result = helpers_1.fallbackSha256(msg);
        }
        return result;
    });
}
exports.sha256 = sha256;
function sha512(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = helpers_1.EMPTY_UINT_ARRAY;
        if (helpers_1.isBrowser()) {
            result = yield helpers_1.browserSha512(msg);
        }
        else if (helpers_1.isNode()) {
            result = helpers_1.nodeSha512(msg);
        }
        else {
            result = helpers_1.fallbackSha512(msg);
        }
        return result;
    });
}
exports.sha512 = sha512;
function ripemd160(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = helpers_1.EMPTY_UINT_ARRAY;
        if (helpers_1.isNode()) {
            result = helpers_1.nodeRipemd160(msg);
        }
        else {
            result = helpers_1.fallbackRipemd160(msg);
        }
        return result;
    });
}
exports.ripemd160 = ripemd160;
//# sourceMappingURL=async.js.map