"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IK = void 0;
const buffer_1 = require("buffer");
const utils_1 = require("../utils");
const abstract_handshake_1 = require("./abstract-handshake");
class IK extends abstract_handshake_1.AbstractHandshake {
    initSession(initiator, prologue, s, rs) {
        const psk = this.createEmptyKey();
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
    sendMessage(session, message) {
        let messageBuffer;
        if (session.mc === 0) {
            messageBuffer = this.writeMessageA(session.hs, message);
        }
        else if (session.mc === 1) {
            const { messageBuffer: mb, h, cs1, cs2 } = this.writeMessageB(session.hs, message);
            messageBuffer = mb;
            session.h = h;
            session.cs1 = cs1;
            session.cs2 = cs2;
        }
        else if (session.mc > 1) {
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
        if (session.mc === 1) {
            const { plaintext: pt, valid: v, h, cs1, cs2 } = this.readMessageB(session.hs, message);
            plaintext = pt;
            valid = v;
            session.h = h;
            session.cs1 = cs1;
            session.cs2 = cs2;
        }
        session.mc++;
        return { plaintext, valid };
    }
    writeMessageA(hs, payload) {
        hs.e = utils_1.generateKeypair();
        const ne = hs.e.publicKey;
        this.mixHash(hs.ss, ne);
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.rs));
        const spk = buffer_1.Buffer.from(hs.s.publicKey);
        const ns = this.encryptAndHash(hs.ss, spk);
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.rs));
        const ciphertext = this.encryptAndHash(hs.ss, payload);
        return { ne, ns, ciphertext };
    }
    writeMessageB(hs, payload) {
        hs.e = utils_1.generateKeypair();
        const ne = hs.e.publicKey;
        this.mixHash(hs.ss, ne);
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.re));
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.rs));
        const ciphertext = this.encryptAndHash(hs.ss, payload);
        const ns = this.createEmptyKey();
        const messageBuffer = { ne, ns, ciphertext };
        const { cs1, cs2 } = this.split(hs.ss);
        return { messageBuffer, cs1, cs2, h: hs.ss.h };
    }
    readMessageA(hs, message) {
        if (utils_1.isValidPublicKey(message.ne)) {
            hs.re = message.ne;
        }
        this.mixHash(hs.ss, hs.re);
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.re));
        const { plaintext: ns, valid: valid1 } = this.decryptAndHash(hs.ss, message.ns);
        if (valid1 && ns.length === 32 && utils_1.isValidPublicKey(ns)) {
            hs.rs = ns;
        }
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.rs));
        const { plaintext, valid: valid2 } = this.decryptAndHash(hs.ss, message.ciphertext);
        return { plaintext, valid: (valid1 && valid2) };
    }
    readMessageB(hs, message) {
        if (utils_1.isValidPublicKey(message.ne)) {
            hs.re = message.ne;
        }
        this.mixHash(hs.ss, hs.re);
        if (!hs.e) {
            throw new Error('Handshake state should contain ephemeral key by now.');
        }
        this.mixKey(hs.ss, this.dh(hs.e.privateKey, hs.re));
        this.mixKey(hs.ss, this.dh(hs.s.privateKey, hs.re));
        const { plaintext, valid } = this.decryptAndHash(hs.ss, message.ciphertext);
        const { cs1, cs2 } = this.split(hs.ss);
        return { h: hs.ss.h, valid, plaintext, cs1, cs2 };
    }
    initializeInitiator(prologue, s, rs, psk) {
        const name = 'Noise_IK_25519_ChaChaPoly_SHA256';
        const ss = this.initializeSymmetric(name);
        this.mixHash(ss, prologue);
        this.mixHash(ss, rs);
        const re = buffer_1.Buffer.alloc(32);
        return { ss, s, rs, re, psk };
    }
    initializeResponder(prologue, s, rs, psk) {
        const name = 'Noise_IK_25519_ChaChaPoly_SHA256';
        const ss = this.initializeSymmetric(name);
        this.mixHash(ss, prologue);
        this.mixHash(ss, s.publicKey);
        const re = buffer_1.Buffer.alloc(32);
        return { ss, s, rs, re, psk };
    }
}
exports.IK = IK;
//# sourceMappingURL=ik.js.map