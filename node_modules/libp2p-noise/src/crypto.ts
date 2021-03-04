import { Buffer } from 'buffer'
import { IHandshake } from './@types/handshake-interface'
import { NOISE_MSG_MAX_LENGTH_BYTES, NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG } from './constants'

interface IReturnEncryptionWrapper {
  (source: Iterable<Uint8Array>): AsyncIterableIterator<Uint8Array>
}

// Returns generator that encrypts payload from the user
export function encryptStream (handshake: IHandshake): IReturnEncryptionWrapper {
  return async function * (source) {
    for await (const chunk of source) {
      const chunkBuffer = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.length)

      for (let i = 0; i < chunkBuffer.length; i += NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG) {
        let end = i + NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG
        if (end > chunkBuffer.length) {
          end = chunkBuffer.length
        }

        const data = handshake.encrypt(chunkBuffer.slice(i, end), handshake.session)
        yield data
      }
    }
  }
}

// Decrypt received payload to the user
export function decryptStream (handshake: IHandshake): IReturnEncryptionWrapper {
  return async function * (source) {
    for await (const chunk of source) {
      const chunkBuffer = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.length)

      for (let i = 0; i < chunkBuffer.length; i += NOISE_MSG_MAX_LENGTH_BYTES) {
        let end = i + NOISE_MSG_MAX_LENGTH_BYTES
        if (end > chunkBuffer.length) {
          end = chunkBuffer.length
        }

        const chunk = chunkBuffer.slice(i, end)
        const { plaintext: decrypted, valid } = await handshake.decrypt(chunk, handshake.session)
        if (!valid) {
          throw new Error('Failed to validate decrypted chunk')
        }
        yield decrypted
      }
    }
  }
}
