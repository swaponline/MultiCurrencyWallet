"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IKHandshake = void 0;
const ik_1 = require("./handshakes/ik");
const buffer_1 = require("buffer");
const encoder_1 = require("./encoder");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
class IKHandshake {
    constructor(isInitiator, payload, prologue, staticKeypair, connection, remoteStaticKey, remotePeer, handshake) {
        this.isInitiator = isInitiator;
        this.payload = buffer_1.Buffer.from(payload);
        this.prologue = prologue;
        this.staticKeypair = staticKeypair;
        this.connection = connection;
        if (remotePeer) {
            this.remotePeer = remotePeer;
        }
        this.ik = handshake !== null && handshake !== void 0 ? handshake : new ik_1.IK();
        this.session = this.ik.initSession(this.isInitiator, this.prologue, this.staticKeypair, remoteStaticKey);
        this.remoteEarlyData = buffer_1.Buffer.alloc(0);
    }
    async stage0() {
        logger_1.logLocalStaticKeys(this.session.hs.s);
        logger_1.logRemoteStaticKey(this.session.hs.rs);
        if (this.isInitiator) {
            logger_1.logger('IK Stage 0 - Initiator sending message...');
            const messageBuffer = this.ik.sendMessage(this.session, this.payload);
            this.connection.writeLP(encoder_1.encode1(messageBuffer));
            logger_1.logger('IK Stage 0 - Initiator sent message.');
            logger_1.logLocalEphemeralKeys(this.session.hs.e);
        }
        else {
            logger_1.logger('IK Stage 0 - Responder receiving message...');
            const receivedMsg = await this.connection.readLP();
            try {
                const receivedMessageBuffer = encoder_1.decode1(receivedMsg.slice());
                const { plaintext, valid } = this.ik.recvMessage(this.session, receivedMessageBuffer);
                if (!valid) {
                    throw new Error('ik handshake stage 0 decryption validation fail');
                }
                logger_1.logger('IK Stage 0 - Responder got message, going to verify payload.');
                const decodedPayload = await utils_1.decodePayload(plaintext);
                this.remotePeer = this.remotePeer || await utils_1.getPeerIdFromPayload(decodedPayload);
                await utils_1.verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer);
                this.setRemoteEarlyData(decodedPayload.data);
                logger_1.logger('IK Stage 0 - Responder successfully verified payload!');
                logger_1.logRemoteEphemeralKey(this.session.hs.re);
            }
            catch (e) {
                const err = e;
                logger_1.logger('Responder breaking up with IK handshake in stage 0.');
                throw new errors_1.FailedIKError(receivedMsg, `Error occurred while verifying initiator's signed payload: ${err.message}`);
            }
        }
    }
    async stage1() {
        if (this.isInitiator) {
            logger_1.logger('IK Stage 1 - Initiator receiving message...');
            const receivedMsg = (await this.connection.readLP()).slice();
            const receivedMessageBuffer = encoder_1.decode0(buffer_1.Buffer.from(receivedMsg));
            const { plaintext, valid } = this.ik.recvMessage(this.session, receivedMessageBuffer);
            logger_1.logger('IK Stage 1 - Initiator got message, going to verify payload.');
            try {
                if (!valid) {
                    throw new Error('ik stage 1 decryption validation fail');
                }
                const decodedPayload = await utils_1.decodePayload(plaintext);
                this.remotePeer = this.remotePeer || await utils_1.getPeerIdFromPayload(decodedPayload);
                await utils_1.verifySignedPayload(receivedMessageBuffer.ns.slice(0, 32), decodedPayload, this.remotePeer);
                this.setRemoteEarlyData(decodedPayload.data);
                logger_1.logger('IK Stage 1 - Initiator successfully verified payload!');
                logger_1.logRemoteEphemeralKey(this.session.hs.re);
            }
            catch (e) {
                const err = e;
                logger_1.logger('Initiator breaking up with IK handshake in stage 1.');
                throw new errors_1.FailedIKError(receivedMsg, `Error occurred while verifying responder's signed payload: ${err.message}`);
            }
        }
        else {
            logger_1.logger('IK Stage 1 - Responder sending message...');
            const messageBuffer = this.ik.sendMessage(this.session, this.payload);
            this.connection.writeLP(encoder_1.encode0(messageBuffer));
            logger_1.logger('IK Stage 1 - Responder sent message...');
            logger_1.logLocalEphemeralKeys(this.session.hs.e);
        }
        logger_1.logCipherState(this.session);
    }
    decrypt(ciphertext, session) {
        const cs = this.getCS(session, false);
        return this.ik.decryptWithAd(cs, buffer_1.Buffer.alloc(0), ciphertext);
    }
    encrypt(plaintext, session) {
        const cs = this.getCS(session);
        return this.ik.encryptWithAd(cs, buffer_1.Buffer.alloc(0), plaintext);
    }
    getLocalEphemeralKeys() {
        if (!this.session.hs.e) {
            throw new Error('Ephemeral keys do not exist.');
        }
        return this.session.hs.e;
    }
    getCS(session, encryption = true) {
        if (!session.cs1 || !session.cs2) {
            throw new Error('Handshake not completed properly, cipher state does not exist.');
        }
        if (this.isInitiator) {
            return encryption ? session.cs1 : session.cs2;
        }
        else {
            return encryption ? session.cs2 : session.cs1;
        }
    }
    setRemoteEarlyData(data) {
        if (data) {
            this.remoteEarlyData = buffer_1.Buffer.from(data.buffer, data.byteOffset, data.length);
        }
    }
}
exports.IKHandshake = IKHandshake;
//# sourceMappingURL=handshake-ik.js.map