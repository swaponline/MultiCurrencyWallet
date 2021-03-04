"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XX = void 0;
const buffer_1 = require("buffer");
const utils_1 = require("../utils");
const abstract_handshake_1 = require("./abstract-handshake");
class XX extends abstract_handshake_1.AbstractHandshake {
    initializeInitiator(prologue, s, rs, psk) {
        const name = 'Noise_XX_25519_ChaChaPoly_SHA256';
        const ss = this.initializeSymmetric(name);
        this.mixHash(ss, prologue);
        const re = buffer_1.Buffer.alloc(32);
        return { ss, s, rs, psk, re };
    }
    initializeResponder(prologue, s, rs, psk) {
        const name = 'Noise_XX_25519_ChaChaPoly_SHA256';
        const ss = this.initializeSymmetric(name);
        this.mixHash(ss, prologue);
        const re = buffer_1.Buffer.alloc(32);
        return { ss, s, rs, psk, re };
    }
    writeMessageA(hs, payload, e) {
        const ns = buffer_1.Buffer.alloc(0);
        if (e !== undefined) {
            hs.e = e;
        }
        else {
            hs.e = utils_1.generateKeypair();
        }
        const ne = hs.e.publicKey;
        this.mixHash(hs.ss, ne);
        const ciphertext = this.encryptAndHash(hs.ss, payload);
        return { ne, ns, ciphertext };
    }
    writeMessageB(hs, payload) {
        hs.e = utils_1.generateKeypair();
        const ne = hs.e.publicKey;
        this.mixHash(hs.ss, ne);
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.re));
        const spk = buffer_1.Buffer.from(hs.s.publicKey);
        const ns = this.encryptAndHash(hs.ss, spk);
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.re));
        const ciphertext = this.encryptAndHash(hs.ss, payload);
        return { ne, ns, ciphertext };
    }
    writeMessageC(hs, payload) {
        const spk = buffer_1.Buffer.from(hs.s.publicKey);
        const ns = this.encryptAndHash(hs.ss, spk);
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.re));
        const ciphertext = this.encryptAndHash(hs.ss, payload);
        const ne = this.createEmptyKey();
        const messageBuffer = { ne, ns, ciphertext };
        const { cs1, cs2 } = this.split(hs.ss);
        return { h: hs.ss.h, messageBuffer, cs1, cs2 };
    }
    readMessageA(hs, message) {
        if (utils_1.isValidPublicKey(message.ne)) {
            hs.re = message.ne;
        }
        this.mixHash(hs.ss, hs.re);
        return this.decryptAndHash(hs.ss, message.ciphertext);
    }
    readMessageB(hs, message) {
        if (utils_1.isValidPublicKey(message.ne)) {
            hs.re = message.ne;
        }
        this.mixHash(hs.ss, hs.re);
        if (!hs.e) {
            throw new Error('Handshake state `e` param is missing.');
        }
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.re));
        const { plaintext: ns, valid: valid1 } = this.decryptAndHash(hs.ss, message.ns);
        if (valid1 && ns.length === 32 && utils_1.isValidPublicKey(ns)) {
            hs.rs = ns;
        }
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.rs));
        const { plaintext, valid: valid2 } = this.decryptAndHash(hs.ss, message.ciphertext);
        return { plaintext, valid: (valid1 && valid2) };
    }
    readMessageC(hs, message) {
        const { plaintext: ns, valid: valid1 } = this.decryptAndHash(hs.ss, message.ns);
        if (valid1 && ns.length === 32 && utils_1.isValidPublicKey(ns)) {
            hs.rs = ns;
        }
        if (!hs.e) {
            throw new Error('Handshake state `e` param is missing.');
        }
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.rs));
        const { plaintext, valid: valid2 } = this.decryptAndHash(hs.ss, message.ciphertext);
        const { cs1, cs2 } = this.split(hs.ss);
        return { h: hs.ss.h, plaintext, valid: (valid1 && valid2), cs1, cs2 };
    }
    initSession(initiator, prologue, s) {
        const psk = this.createEmptyKey();
        const rs = buffer_1.Buffer.alloc(32); // no static key yet
        let hs;
        if (initiator) {
            hs = this.initializeInitiator(prologue, s, rs, psk);
        }
        else {
            hs = this.initializeResponder(prologue, s, rs, psk);
        }
        return {
            hs,
            i: initiator,
            mc: 0
        };
    }
    sendMessage(session, message, ephemeral) {
        let messageBuffer;
        if (session.mc === 0) {
            messageBuffer = this.writeMessageA(session.hs, message, ephemeral);
        }
        else if (session.mc === 1) {
            messageBuffer = this.writeMessageB(session.hs, message);
        }
        else if (session.mc === 2) {
            const { h, messageBuffer: resultingBuffer, cs1, cs2 } = this.writeMessageC(session.hs, message);
            messageBuffer = resultingBuffer;
            session.h = h;
            session.cs1 = cs1;
            session.cs2 = cs2;
        }
        else if (session.mc > 2) {
            if (session.i) {
                if (!session.cs1) {
                    throw new Error('CS1 (cipher state) is not defined');
                }
                messageBuffer = this.writeMessageRegular(session.cs1, message);
            }
            else {
                if (!session.cs2) {
                    throw new Error('CS2 (cipher state) is not defined');
                }
                messageBuffer = this.writeMessageRegular(session.cs2, message);
            }
        }
        else {
            throw new Error('Session invalid.');
        }
        session.mc++;
        return messageBuffer;
    }
    recvMessage(session, message) {
        let plaintext = buffer_1.Buffer.alloc(0);
        let valid = false;
        if (session.mc === 0) {
            ({ plaintext, valid } = this.readMessageA(session.hs, message));
        }
        else if (session.mc === 1) {
            ({ plaintext, valid } = this.readMessageB(session.hs, message));
        }
        else if (session.mc === 2) {
            const { h, plaintext: resultingPlaintext, valid: resultingValid, cs1, cs2 } = this.readMessageC(session.hs, message);
            plaintext = resultingPlaintext;
            valid = resultingValid;
            session.h = h;
            session.cs1 = cs1;
            session.cs2 = cs2;
        }
        session.mc++;
        return { plaintext, valid };
    }
}
exports.XX = XX;
//# sourceMappingURL=xx.js.map