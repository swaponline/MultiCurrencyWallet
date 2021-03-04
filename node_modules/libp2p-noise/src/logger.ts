import debug from 'debug'
import { DUMP_SESSION_KEYS } from './constants'
import { KeyPair } from './@types/libp2p'
import { NoiseSession } from './@types/handshake'

export const logger = debug('libp2p:noise')

let keyLogger
if (DUMP_SESSION_KEYS) {
  keyLogger = logger
} else {
  keyLogger = () => { /* do nothing */ }
}

export function logLocalStaticKeys (s: KeyPair): void {
  keyLogger(`LOCAL_STATIC_PUBLIC_KEY ${s.publicKey.toString('hex')}`)
  keyLogger(`LOCAL_STATIC_PRIVATE_KEY ${s.privateKey.toString('hex')}`)
}

export function logLocalEphemeralKeys (e: KeyPair|undefined): void {
  if (e) {
    keyLogger(`LOCAL_PUBLIC_EPHEMERAL_KEY ${e.publicKey.toString('hex')}`)
    keyLogger(`LOCAL_PRIVATE_EPHEMERAL_KEY ${e.privateKey.toString('hex')}`)
  } else {
    keyLogger('Missing local ephemeral keys.')
  }
}

export function logRemoteStaticKey (rs: Buffer): void {
  keyLogger(`REMOTE_STATIC_PUBLIC_KEY ${rs.toString('hex')}`)
}

export function logRemoteEphemeralKey (re: Buffer): void {
  keyLogger(`REMOTE_EPHEMERAL_PUBLIC_KEY ${re.toString('hex')}`)
}

export function logCipherState (session: NoiseSession): void {
  if (session.cs1 && session.cs2) {
    keyLogger(`CIPHER_STATE_1 ${session.cs1.n} ${session.cs1.k.toString('hex')}`)
    keyLogger(`CIPHER_STATE_2 ${session.cs2.n} ${session.cs2.k.toString('hex')}`)
  } else {
    keyLogger('Missing cipher state.')
  }
}
