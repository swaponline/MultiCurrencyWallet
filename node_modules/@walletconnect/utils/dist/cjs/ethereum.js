"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha3_1 = require("js-sha3");
const encoding_1 = require("./encoding");
const misc_1 = require("./misc");
const validators_1 = require("./validators");
const enc_utils_1 = require("enc-utils");
function toChecksumAddress(address) {
    address = enc_utils_1.removeHexPrefix(address.toLowerCase());
    const hash = enc_utils_1.removeHexPrefix(js_sha3_1.keccak_256(encoding_1.convertUtf8ToBuffer(address)));
    let checksum = "";
    for (let i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) > 7) {
            checksum += address[i].toUpperCase();
        }
        else {
            checksum += address[i];
        }
    }
    return enc_utils_1.addHexPrefix(checksum);
}
exports.toChecksumAddress = toChecksumAddress;
exports.isValidAddress = (address) => {
    if (!address) {
        return false;
    }
    else if (address.toLowerCase().substring(0, 2) !== "0x") {
        return false;
    }
    else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
    }
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return true;
    }
    else {
        return address === toChecksumAddress(address);
    }
};
function parsePersonalSign(params) {
    if (!validators_1.isEmptyArray(params) && !validators_1.isHexString(params[0])) {
        params[0] = encoding_1.convertUtf8ToHex(params[0]);
    }
    return params;
}
exports.parsePersonalSign = parsePersonalSign;
function parseTransactionData(txData) {
    if (typeof txData.from === "undefined" || !exports.isValidAddress(txData.from)) {
        throw new Error(`Transaction object must include a valid 'from' value.`);
    }
    function parseHexValues(value) {
        let result = value;
        if (typeof value === "number" || (typeof value === "string" && !validators_1.isEmptyString(value))) {
            if (!validators_1.isHexString(value)) {
                result = encoding_1.convertNumberToHex(value);
            }
            else if (typeof value === "string") {
                result = misc_1.sanitizeHex(value);
            }
        }
        if (typeof result === "string") {
            result = misc_1.removeHexLeadingZeros(result);
        }
        return result;
    }
    const txDataRPC = {
        from: misc_1.sanitizeHex(txData.from),
        to: typeof txData.to === "undefined" ? "" : misc_1.sanitizeHex(txData.to),
        gasPrice: typeof txData.gasPrice === "undefined" ? "" : parseHexValues(txData.gasPrice),
        gas: typeof txData.gas === "undefined"
            ? typeof txData.gasLimit === "undefined"
                ? ""
                : parseHexValues(txData.gasLimit)
            : parseHexValues(txData.gas),
        value: typeof txData.value === "undefined" ? "" : parseHexValues(txData.value),
        nonce: typeof txData.nonce === "undefined" ? "" : parseHexValues(txData.nonce),
        data: typeof txData.data === "undefined" ? "" : misc_1.sanitizeHex(txData.data) || "0x",
    };
    const prunable = ["gasPrice", "gas", "value", "nonce"];
    Object.keys(txDataRPC).forEach((key) => {
        if (!txDataRPC[key].trim().length && prunable.includes(key)) {
            delete txDataRPC[key];
        }
    });
    return txDataRPC;
}
exports.parseTransactionData = parseTransactionData;
//# sourceMappingURL=ethereum.js.map