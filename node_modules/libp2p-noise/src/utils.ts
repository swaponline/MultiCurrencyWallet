import HKDF from 'bcrypto/lib/hkdf'
import x25519 from 'bcrypto/lib/js/x25519'
import SHA256 from 'bcrypto/lib/js/sha256'
import { Buffer } from 'buffer'
import PeerId from 'peer-id'
import { keys } from 'libp2p-crypto'
import { KeyPair } from './@types/libp2p'
import { bytes, bytes32 } from './@types/basic'
import { Hkdf, INoisePayload } from './@types/handshake'
import { pb } from './proto/payload'
import uint8ArrayEquals from 'uint8arrays/equals'

const NoiseHandshakePayloadProto = pb.NoiseHandshakePayload

export function generateKeypair (): KeyPair {
  const privateKey = x25519.privateKeyGenerate()
  const publicKey = x25519.publicKeyCreate(privateKey)

  return {
    publicKey,
    privateKey
  }
}

export async function getPayload (
  localPeer: PeerId,
  staticPublicKey: bytes,
  earlyData?: bytes
): Promise<bytes> {
  const signedPayload = await signPayload(localPeer, getHandshakePayload(staticPublicKey))
  const earlyDataPayload = earlyData ?? Buffer.alloc(0)

  return createHandshakePayload(
    localPeer.marshalPubKey(),
    signedPayload,
    earlyDataPayload
  )
}

export function createHandshakePayload (
  libp2pPublicKey: Uint8Array,
  signedPayload: Uint8Array,
  earlyData?: Uint8Array
): bytes {
  const payloadInit = NoiseHandshakePayloadProto.create({
    identityKey: Buffer.from(libp2pPublicKey),
    identitySig: signedPayload,
    data: earlyData ?? null
  })

  return Buffer.from(NoiseHandshakePayloadProto.encode(payloadInit).finish())
}

export async function signPayload (peerId: PeerId, payload: bytes): Promise<bytes> {
  return Buffer.from(await peerId.privKey.sign(payload))
}

export async function getPeerIdFromPayload (payload: pb.INoiseHandshakePayload): Promise<PeerId> {
  return await PeerId.createFromPubKey(Buffer.from(payload.identityKey as Uint8Array))
}

export function decodePayload (payload: bytes|Uint8Array): pb.INoiseHandshakePayload {
  return NoiseHandshakePayloadProto.toObject(
    NoiseHandshakePayloadProto.decode(Buffer.from(payload))
  ) as INoisePayload
}

export function getHandshakePayload (publicKey: bytes): bytes {
  return Buffer.concat([Buffer.from('noise-libp2p-static-key:'), publicKey])
}

async function isValidPeerId (peerId: Uint8Array, publicKeyProtobuf: bytes) {
  const generatedPeerId = await PeerId.createFromPubKey(publicKeyProtobuf)
  return uint8ArrayEquals(generatedPeerId.id, peerId)
}

/**
 * Verifies signed payload, throws on any irregularities.
 *
 * @param {bytes} noiseStaticKey - owner's noise static key
 * @param {bytes} payload - decoded payload
 * @param {PeerId} remotePeer - owner's libp2p peer ID
 * @returns {Promise<PeerId>} - peer ID of payload owner
 */
export async function verifySignedPayload (
  noiseStaticKey: bytes,
  payload: pb.INoiseHandshakePayload,
  remotePeer: PeerId
): Promise<PeerId> {
  const identityKey = Buffer.from(payload.identityKey as Uint8Array)
  if (!(await isValidPeerId(remotePeer.id, identityKey))) {
    throw new Error("Peer ID doesn't match libp2p public key.")
  }
  const generatedPayload = getHandshakePayload(noiseStaticKey)
  // Unmarshaling from PublicKey protobuf
  const publicKey = keys.unmarshalPublicKey(identityKey)
  // TODO remove this after libp2p-crypto ships proper types
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  if (!payload.identitySig || !publicKey.verify(generatedPayload, Buffer.from(payload.identitySig))) {
    throw new Error("Static key doesn't match to peer that signed payload!")
  }
  return await PeerId.createFromPubKey(identityKey)
}

export function getHkdf (ck: bytes32, ikm: bytes): Hkdf {
  const info = Buffer.alloc(0)
  const prk = HKDF.extract(SHA256, ikm, ck)
  const okm = HKDF.expand(SHA256, prk, info, 96)

  const k1 = okm.slice(0, 32)
  const k2 = okm.slice(32, 64)
  const k3 = okm.slice(64, 96)

  return [k1, k2, k3]
}

export function isValidPublicKey (pk: bytes): boolean {
  return x25519.publicKeyVerify(pk.slice(0, 32))
}
