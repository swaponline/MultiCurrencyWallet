"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XXHandshake = void 0;
const buffer_1 = require("buffer");
const xx_1 = require("./handshakes/xx");
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const encoder_1 = require("./encoder");
class XXHandshake {
    constructor(isInitiator, payload, prologue, staticKeypair, connection, remotePeer, handshake) {
        this.isInitiator = isInitiator;
        this.payload = payload;
        this.prologue = prologue;
        this.staticKeypair = staticKeypair;
        this.connection = connection;
        if (remotePeer) {
            this.remotePeer = remotePeer;
        }
        this.xx = handshake !== null && handshake !== void 0 ? handshake : new xx_1.XX();
        this.session = this.xx.initSession(this.isInitiator, this.prologue, this.staticKeypair);
        this.remoteEarlyData = buffer_1.Buffer.alloc(0);
    }
    // stage 0
    async propose() {
        logger_1.logLocalStaticKeys(this.session.hs.s);
        if (this.isInitiator) {
            logger_1.logger('Stage 0 - Initiator starting to send first message.');
            const messageBuffer = this.xx.sendMessage(this.session, buffer_1.Buffer.alloc(0));
            this.connection.writeLP(encoder_1.encode0(messageBuffer));
            logger_1.logger('Stage 0 - Initiator finished sending first message.');
            logger_1.logLocalEphemeralKeys(this.session.hs.e);
        }
        else {
            logger_1.logger('Stage 0 - Responder waiting to receive first message...');
            const receivedMessageBuffer = encoder_1.decode0((await this.connection.readLP()).slice());
            const { valid } = this.xx.recvMessage(this.session, receivedMessageBuffer);
            if (!valid) {
                throw new Error('xx handshake stage 0 validation fail');
            }
            logger_1.logger('Stage 0 - Responder received first message.');
            logger_1.logRemoteEphemeralKey(this.session.hs.re);
        }
    }
    // stage 1
    async exchange() {
        if (this.isInitiator) {
            logger_1.logger('Stage 1 - Initiator waiting to receive first message from responder...');
            const receivedMessageBuffer = encoder_1.decode1((await this.connection.readLP()).slice());
            const { plaintext, valid } = this.xx.recvMessage(this.session, receivedMessageBuffer);
            if (!valid) {
                throw new Error('xx handshake stage 1 validation fail');
            }
            logger_1.logger('Stage 1 - Initiator received the message.');
            logger_1.logRemoteEphemeralKey(this.session.hs.re);
            logger_1.logRemoteStaticKey(this.session.hs.rs);
            logger_1.logger("Initiator going to check remote's signature...");
            try {
                const decodedPayload = await utils_1.decodePayload(plaintext);
                this.remotePeer = this.remotePeer || await utils_1.getPeerIdFromPayload(decodedPayload);
                this.remotePeer = await utils_1.verifySignedPayload(receivedMessageBuffer.ns, decodedPayload, this.remotePeer);
                this.setRemoteEarlyData(decodedPayload.data);
            }
            catch (e) {
                const err = e;
                throw new Error(`Error occurred while verifying signed payload: ${err.message}`);
            }
            logger_1.logger('All good with the signature!');
        }
        else {
            logger_1.logger('Stage 1 - Responder sending out first message with signed payload and static key.');
            const messageBuffer = this.xx.sendMessage(this.session, this.payload);
            this.connection.writeLP(encoder_1.encode1(messageBuffer));
            logger_1.logger('Stage 1 - Responder sent the second handshake message with signed payload.');
            logger_1.logLocalEphemeralKeys(this.session.hs.e);
        }
    }
    // stage 2
    async finish() {
        if (this.isInitiator) {
            logger_1.logger('Stage 2 - Initiator sending third handshake message.');
            const messageBuffer = this.xx.sendMessage(this.session, this.payload);
            this.connection.writeLP(encoder_1.encode2(messageBuffer));
            logger_1.logger('Stage 2 - Initiator sent message with signed payload.');
        }
        else {
            logger_1.logger('Stage 2 - Responder waiting for third handshake message...');
            const receivedMessageBuffer = encoder_1.decode2((await this.connection.readLP()).slice());
            const { plaintext, valid } = this.xx.recvMessage(this.session, receivedMessageBuffer);
            if (!valid) {
                throw new Error('xx handshake stage 2 validation fail');
            }
            logger_1.logger('Stage 2 - Responder received the message, finished handshake.');
            try {
                const decodedPayload = await utils_1.decodePayload(plaintext);
                this.remotePeer = this.remotePeer || await utils_1.getPeerIdFromPayload(decodedPayload);
                await utils_1.verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer);
                this.setRemoteEarlyData(decodedPayload.data);
            }
            catch (e) {
                const err = e;
                throw new Error(`Error occurred while verifying signed payload: ${err.message}`);
            }
        }
        logger_1.logCipherState(this.session);
    }
    encrypt(plaintext, session) {
        const cs = this.getCS(session);
        return this.xx.encryptWithAd(cs, buffer_1.Buffer.alloc(0), plaintext);
    }
    decrypt(ciphertext, session) {
        const cs = this.getCS(session, false);
        return this.xx.decryptWithAd(cs, buffer_1.Buffer.alloc(0), ciphertext);
    }
    getRemoteStaticKey() {
        return this.session.hs.rs;
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
exports.XXHandshake = XXHandshake;
//# sourceMappingURL=handshake-xx.js.map