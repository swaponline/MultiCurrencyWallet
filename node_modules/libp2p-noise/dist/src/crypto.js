"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptStream = exports.encryptStream = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("./constants");
// Returns generator that encrypts payload from the user
function encryptStream(handshake) {
    return async function* (source) {
        for await (const chunk of source) {
            const chunkBuffer = buffer_1.Buffer.from(chunk.buffer, chunk.byteOffset, chunk.length);
            for (let i = 0; i < chunkBuffer.length; i += constants_1.NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG) {
                let end = i + constants_1.NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG;
                if (end > chunkBuffer.length) {
                    end = chunkBuffer.length;
                }
                const data = handshake.encrypt(chunkBuffer.slice(i, end), handshake.session);
                yield data;
            }
        }
    };
}
exports.encryptStream = encryptStream;
// Decrypt received payload to the user
function decryptStream(handshake) {
    return async function* (source) {
        for await (const chunk of source) {
            const chunkBuffer = buffer_1.Buffer.from(chunk.buffer, chunk.byteOffset, chunk.length);
            for (let i = 0; i < chunkBuffer.length; i += constants_1.NOISE_MSG_MAX_LENGTH_BYTES) {
                let end = i + constants_1.NOISE_MSG_MAX_LENGTH_BYTES;
                if (end > chunkBuffer.length) {
                    end = chunkBuffer.length;
                }
                const chunk = chunkBuffer.slice(i, end);
                const { plaintext: decrypted, valid } = await handshake.decrypt(chunk, handshake.session);
                if (!valid) {
                    throw new Error('Failed to validate decrypted chunk');
                }
                yield decrypted;
            }
        }
    };
}
exports.decryptStream = decryptStream;
//# sourceMappingURL=crypto.js.map