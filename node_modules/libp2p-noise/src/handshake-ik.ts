import { WrappedConnection } from './noise'
import { IK } from './handshakes/ik'
import { NoiseSession } from './@types/handshake'
import { bytes, bytes32 } from './@types/basic'
import { KeyPair } from './@types/libp2p'
import { IHandshake } from './@types/handshake-interface'
import { Buffer } from 'buffer'
import { decode0, decode1, encode0, encode1 } from './encoder'
import { decodePayload, getPeerIdFromPayload, verifySignedPayload } from './utils'
import { FailedIKError } from './errors'
import {
  logger,
  logLocalStaticKeys,
  logRemoteStaticKey,
  logLocalEphemeralKeys,
  logRemoteEphemeralKey,
  logCipherState
} from './logger'
import PeerId from 'peer-id'

export class IKHandshake implements IHandshake {
  public isInitiator: boolean
  public session: NoiseSession
  public remotePeer!: PeerId
  public remoteEarlyData: Buffer

  private readonly payload: bytes
  private readonly prologue: bytes32
  private readonly staticKeypair: KeyPair
  private readonly connection: WrappedConnection
  private readonly ik: IK

  constructor (
    isInitiator: boolean,
    payload: bytes,
    prologue: bytes32,
    staticKeypair: KeyPair,
    connection: WrappedConnection,
    remoteStaticKey: bytes,
    remotePeer?: PeerId,
    handshake?: IK
  ) {
    this.isInitiator = isInitiator
    this.payload = Buffer.from(payload)
    this.prologue = prologue
    this.staticKeypair = staticKeypair
    this.connection = connection
    if (remotePeer) {
      this.remotePeer = remotePeer
    }
    this.ik = handshake ?? new IK()
    this.session = this.ik.initSession(this.isInitiator, this.prologue, this.staticKeypair, remoteStaticKey)
    this.remoteEarlyData = Buffer.alloc(0)
  }

  public async stage0 (): Promise<void> {
    logLocalStaticKeys(this.session.hs.s)
    logRemoteStaticKey(this.session.hs.rs)
    if (this.isInitiator) {
      logger('IK Stage 0 - Initiator sending message...')
      const messageBuffer = this.ik.sendMessage(this.session, this.payload)
      this.connection.writeLP(encode1(messageBuffer))
      logger('IK Stage 0 - Initiator sent message.')
      logLocalEphemeralKeys(this.session.hs.e)
    } else {
      logger('IK Stage 0 - Responder receiving message...')
      const receivedMsg = await this.connection.readLP()
      try {
        const receivedMessageBuffer = decode1(receivedMsg.slice())
        const { plaintext, valid } = this.ik.recvMessage(this.session, receivedMessageBuffer)
        if (!valid) {
          throw new Error('ik handshake stage 0 decryption validation fail')
        }
        logger('IK Stage 0 - Responder got message, going to verify payload.')
        const decodedPayload = await decodePayload(plaintext)
        this.remotePeer = this.remotePeer || await getPeerIdFromPayload(decodedPayload)
        await verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer)
        this.setRemoteEarlyData(decodedPayload.data)
        logger('IK Stage 0 - Responder successfully verified payload!')
        logRemoteEphemeralKey(this.session.hs.re)
      } catch (e) {
        const err = e as Error
        logger('Responder breaking up with IK handshake in stage 0.')

        throw new FailedIKError(receivedMsg, `Error occurred while verifying initiator's signed payload: ${err.message}`)
      }
    }
  }

  public async stage1 (): Promise<void> {
    if (this.isInitiator) {
      logger('IK Stage 1 - Initiator receiving message...')
      const receivedMsg = (await this.connection.readLP()).slice()
      const receivedMessageBuffer = decode0(Buffer.from(receivedMsg))
      const { plaintext, valid } = this.ik.recvMessage(this.session, receivedMessageBuffer)
      logger('IK Stage 1 - Initiator got message, going to verify payload.')
      try {
        if (!valid) {
          throw new Error('ik stage 1 decryption validation fail')
        }
        const decodedPayload = await decodePayload(plaintext)
        this.remotePeer = this.remotePeer || await getPeerIdFromPayload(decodedPayload)
        await verifySignedPayload(receivedMessageBuffer.ns.slice(0, 32), decodedPayload, this.remotePeer)
        this.setRemoteEarlyData(decodedPayload.data)
        logger('IK Stage 1 - Initiator successfully verified payload!')
        logRemoteEphemeralKey(this.session.hs.re)
      } catch (e) {
        const err = e as Error
        logger('Initiator breaking up with IK handshake in stage 1.')
        throw new FailedIKError(receivedMsg, `Error occurred while verifying responder's signed payload: ${err.message}`)
      }
    } else {
      logger('IK Stage 1 - Responder sending message...')
      const messageBuffer = this.ik.sendMessage(this.session, this.payload)
      this.connection.writeLP(encode0(messageBuffer))
      logger('IK Stage 1 - Responder sent message...')
      logLocalEphemeralKeys(this.session.hs.e)
    }
    logCipherState(this.session)
  }

  public decrypt (ciphertext: bytes, session: NoiseSession): {plaintext: bytes, valid: boolean} {
    const cs = this.getCS(session, false)
    return this.ik.decryptWithAd(cs, Buffer.alloc(0), ciphertext)
  }

  public encrypt (plaintext: Buffer, session: NoiseSession): Buffer {
    const cs = this.getCS(session)
    return this.ik.encryptWithAd(cs, Buffer.alloc(0), plaintext)
  }

  public getLocalEphemeralKeys (): KeyPair {
    if (!this.session.hs.e) {
      throw new Error('Ephemeral keys do not exist.')
    }

    return this.session.hs.e
  }

  private getCS (session: NoiseSession, encryption = true) {
    if (!session.cs1 || !session.cs2) {
      throw new Error('Handshake not completed properly, cipher state does not exist.')
    }

    if (this.isInitiator) {
      return encryption ? session.cs1 : session.cs2
    } else {
      return encryption ? session.cs2 : session.cs1
    }
  }

  private setRemoteEarlyData (data: Uint8Array|null|undefined): void {
    if (data) {
      this.remoteEarlyData = Buffer.from(data.buffer, data.byteOffset, data.length)
    }
  }
}
