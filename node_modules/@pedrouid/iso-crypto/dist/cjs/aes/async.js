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
exports.aesCbcDecrypt = exports.aesCbcEncrypt = void 0;
const helpers_1 = require("../helpers");
function aesCbcEncrypt(iv, key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        if (helpers_1.isBrowser()) {
            result = yield helpers_1.browserAesEncrypt(iv, key, data);
        }
        else if (helpers_1.isNode()) {
            result = helpers_1.nodeAesEncrypt(iv, key, data);
        }
        else {
            result = helpers_1.fallbackAesEncrypt(iv, key, data);
        }
        return result;
    });
}
exports.aesCbcEncrypt = aesCbcEncrypt;
function aesCbcDecrypt(iv, key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        if (helpers_1.isBrowser()) {
            result = yield helpers_1.browserAesDecrypt(iv, key, data);
        }
        else if (helpers_1.isNode()) {
            result = helpers_1.nodeAesDecrypt(iv, key, data);
        }
        else {
            result = helpers_1.fallbackAesDecrypt(iv, key, data);
        }
        return result;
    });
}
exports.aesCbcDecrypt = aesCbcDecrypt;
//# sourceMappingURL=async.js.map