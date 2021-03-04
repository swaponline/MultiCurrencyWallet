import { bytes, bytes32, uint32, uint64 } from './basic'
import { KeyPair } from './libp2p'

export type Hkdf = [bytes, bytes, bytes]

export interface MessageBuffer {
  ne: bytes32
  ns: bytes
  ciphertext: bytes
}

export interface CipherState {
  k: bytes32
  n: uint32
}

export interface SymmetricState {
  cs: CipherState
  ck: bytes32 // chaining key
  h: bytes32 // handshake hash
}

export interface HandshakeState {
  ss: SymmetricState
  s: KeyPair
  e?: KeyPair
  rs: bytes32
  re: bytes32
  psk: bytes32
}

export interface NoiseSession {
  hs: HandshakeState
  h?: bytes32
  cs1?: CipherState
  cs2?: CipherState
  mc: uint64
  i: boolean
}

export interface INoisePayload {
  identityKey: bytes
  identitySig: bytes
  data: bytes
}
