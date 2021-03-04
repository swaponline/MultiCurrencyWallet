"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XXFallbackHandshake = void 0;
const buffer_1 = require("buffer");
const handshake_xx_1 = require("./handshake-xx");
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const encoder_1 = require("./encoder");
class XXFallbackHandshake extends handshake_xx_1.XXHandshake {
    constructor(isInitiator, payload, prologue, staticKeypair, connection, initialMsg, remotePeer, ephemeralKeys, handshake) {
        super(isInitiator, payload, prologue, staticKeypair, connection, remotePeer, handshake);
        if (ephemeralKeys) {
            this.ephemeralKeys = ephemeralKeys;
        }
        this.initialMsg = initialMsg;
    }
    // stage 0
    // eslint-disable-next-line require-await
    async propose() {
        if (this.isInitiator) {
            this.xx.sendMessage(this.session, buffer_1.Buffer.alloc(0), this.ephemeralKeys);
            logger_1.logger('XX Fallback Stage 0 - Initialized state as the first message was sent by initiator.');
            logger_1.logLocalEphemeralKeys(this.session.hs.e);
        }
        else {
            logger_1.logger('XX Fallback Stage 0 - Responder decoding initial msg from IK.');
            const receivedMessageBuffer = encoder_1.decode0(this.initialMsg);
            const { valid } = this.xx.recvMessage(this.session, {
                ne: receivedMessageBuffer.ne,
                ns: buffer_1.Buffer.alloc(0),
                ciphertext: buffer_1.Buffer.alloc(0)
            });
            if (!valid) {
                throw new Error('xx fallback stage 0 decryption validation fail');
            }
            logger_1.logger('XX Fallback Stage 0 - Responder used received message from IK.');
            logger_1.logRemoteEphemeralKey(this.session.hs.re);
        }
    }
    // stage 1
    async exchange() {
        if (this.isInitiator) {
            const receivedMessageBuffer = encoder_1.decode1(this.initialMsg);
            const { plaintext, valid } = this.xx.recvMessage(this.session, receivedMessageBuffer);
            if (!valid) {
                throw new Error('xx fallback stage 1 decryption validation fail');
            }
            logger_1.logger('XX Fallback Stage 1 - Initiator used received message from IK.');
            logger_1.logRemoteEphemeralKey(this.session.hs.re);
            logger_1.logRemoteStaticKey(this.session.hs.rs);
            logger_1.logger("Initiator going to check remote's signature...");
            try {
                const decodedPayload = await utils_1.decodePayload(plaintext);
                this.remotePeer = this.remotePeer || await utils_1.getPeerIdFromPayload(decodedPayload);
                await utils_1.verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer);
                this.setRemoteEarlyData(decodedPayload.data);
            }
            catch (e) {
                const err = e;
                throw new Error(`Error occurred while verifying signed payload from responder: ${err.message}`);
            }
            logger_1.logger('All good with the signature!');
        }
        else {
            logger_1.logger('XX Fallback Stage 1 - Responder start');
            await super.exchange();
            logger_1.logger('XX Fallback Stage 1 - Responder end');
        }
    }
}
exports.XXFallbackHandshake = XXFallbackHandshake;
//# sourceMappingURL=handshake-xx-fallback.js.map