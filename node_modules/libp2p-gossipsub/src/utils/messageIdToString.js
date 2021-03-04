"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageIdToString = void 0;
// remove ts-ignore once https://github.com/achingbrain/uint8arrays/pull/4 is merged
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const toString = require("uint8arrays/to-string");
function messageIdToString(msgId) {
    return toString(msgId, 'base64');
}
exports.messageIdToString = messageIdToString;
