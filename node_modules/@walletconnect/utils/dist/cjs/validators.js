"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const encUtils = tslib_1.__importStar(require("enc-utils"));
const constants_1 = require("./constants");
function isEmptyString(value) {
    return value === "" || (typeof value === "string" && value.trim() === "");
}
exports.isEmptyString = isEmptyString;
function isEmptyArray(array) {
    return !(array && array.length);
}
exports.isEmptyArray = isEmptyArray;
function isBuffer(val) {
    return encUtils.isBuffer(val);
}
exports.isBuffer = isBuffer;
function isTypedArray(val) {
    return encUtils.isTypedArray(val);
}
exports.isTypedArray = isTypedArray;
function isArrayBuffer(val) {
    return encUtils.isArrayBuffer(val);
}
exports.isArrayBuffer = isArrayBuffer;
function getType(val) {
    return encUtils.getType(val);
}
exports.getType = getType;
function getEncoding(val) {
    return encUtils.getEncoding(val);
}
exports.getEncoding = getEncoding;
function isHexString(value, length) {
    return encUtils.isHexString(value, length);
}
exports.isHexString = isHexString;
function isJsonRpcSubscription(object) {
    return typeof object.params === "object";
}
exports.isJsonRpcSubscription = isJsonRpcSubscription;
function isJsonRpcRequest(object) {
    return typeof object.method !== "undefined";
}
exports.isJsonRpcRequest = isJsonRpcRequest;
function isJsonRpcResponseSuccess(object) {
    return typeof object.result !== "undefined";
}
exports.isJsonRpcResponseSuccess = isJsonRpcResponseSuccess;
function isJsonRpcResponseError(object) {
    return typeof object.error !== "undefined";
}
exports.isJsonRpcResponseError = isJsonRpcResponseError;
function isInternalEvent(object) {
    return typeof object.event !== "undefined";
}
exports.isInternalEvent = isInternalEvent;
function isReservedEvent(event) {
    return constants_1.reservedEvents.includes(event) || event.startsWith("wc_");
}
exports.isReservedEvent = isReservedEvent;
function isSilentPayload(request) {
    if (request.method.startsWith("wc_")) {
        return true;
    }
    if (constants_1.signingMethods.includes(request.method)) {
        return false;
    }
    return true;
}
exports.isSilentPayload = isSilentPayload;
//# sourceMappingURL=validators.js.map