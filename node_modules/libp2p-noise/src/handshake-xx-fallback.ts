import { Buffer } from 'buffer'
import { XXHandshake } from './handshake-xx'
import { XX } from './handshakes/xx'
import { KeyPair } from './@types/libp2p'
import { bytes, bytes32 } from './@types/basic'
import { decodePayload, getPeerIdFromPayload, verifySignedPayload } from './utils'
import { logger, logLocalEphemeralKeys, logRemoteEphemeralKey, logRemoteStaticKey } from './logger'
import { WrappedConnection } from './noise'
import { decode0, decode1 } from './encoder'
import PeerId from 'peer-id'

export class XXFallbackHandshake extends XXHandshake {
  private readonly ephemeralKeys?: KeyPair
  private readonly initialMsg: bytes

  constructor (
    isInitiator: boolean,
    payload: bytes,
    prologue: bytes32,
    staticKeypair: KeyPair,
    connection: WrappedConnection,
    initialMsg: bytes,
    remotePeer?: PeerId,
    ephemeralKeys?: KeyPair,
    handshake?: XX
  ) {
    super(isInitiator, payload, prologue, staticKeypair, connection, remotePeer, handshake)
    if (ephemeralKeys) {
      this.ephemeralKeys = ephemeralKeys
    }
    this.initialMsg = initialMsg
  }

  // stage 0
  // eslint-disable-next-line require-await
  public async propose (): Promise<void> {
    if (this.isInitiator) {
      this.xx.sendMessage(this.session, Buffer.alloc(0), this.ephemeralKeys)
      logger('XX Fallback Stage 0 - Initialized state as the first message was sent by initiator.')
      logLocalEphemeralKeys(this.session.hs.e)
    } else {
      logger('XX Fallback Stage 0 - Responder decoding initial msg from IK.')
      const receivedMessageBuffer = decode0(this.initialMsg)
      const { valid } = this.xx.recvMessage(this.session, {
        ne: receivedMessageBuffer.ne,
        ns: Buffer.alloc(0),
        ciphertext: Buffer.alloc(0)
      })
      if (!valid) {
        throw new Error('xx fallback stage 0 decryption validation fail')
      }
      logger('XX Fallback Stage 0 - Responder used received message from IK.')
      logRemoteEphemeralKey(this.session.hs.re)
    }
  }

  // stage 1
  public async exchange (): Promise<void> {
    if (this.isInitiator) {
      const receivedMessageBuffer = decode1(this.initialMsg)
      const { plaintext, valid } = this.xx.recvMessage(this.session, receivedMessageBuffer)
      if (!valid) {
        throw new Error('xx fallback stage 1 decryption validation fail')
      }
      logger('XX Fallback Stage 1 - Initiator used received message from IK.')
      logRemoteEphemeralKey(this.session.hs.re)
      logRemoteStaticKey(this.session.hs.rs)

      logger("Initiator going to check remote's signature...")
      try {
        const decodedPayload = await decodePayload(plaintext)
        this.remotePeer = this.remotePeer || await getPeerIdFromPayload(decodedPayload)
        await verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer)
        this.setRemoteEarlyData(decodedPayload.data)
      } catch (e) {
        const err = e as Error
        throw new Error(`Error occurred while verifying signed payload from responder: ${err.message}`)
      }
      logger('All good with the signature!')
    } else {
      logger('XX Fallback Stage 1 - Responder start')
      await super.exchange()
      logger('XX Fallback Stage 1 - Responder end')
    }
  }
}
