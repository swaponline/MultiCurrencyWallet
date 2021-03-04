import { Buffer } from 'buffer'
import { bytes } from './@types/basic'
import { MessageBuffer } from './@types/handshake'
import BufferList from 'bl'

export const uint16BEEncode = (value: number, target: Buffer, offset: number): Buffer => {
  target = target || Buffer.allocUnsafe(2)
  target.writeUInt16BE(value, offset)
  return target
}
uint16BEEncode.bytes = 2

export const uint16BEDecode = (data: Buffer | BufferList): number => {
  if (data.length < 2) throw RangeError('Could not decode int16BE')
  return data.readUInt16BE(0)
}
uint16BEDecode.bytes = 2

// Note: IK and XX encoder usage is opposite (XX uses in stages encode0 where IK uses encode1)

export function encode0 (message: MessageBuffer): bytes {
  return Buffer.concat([message.ne, message.ciphertext])
}

export function encode1 (message: MessageBuffer): bytes {
  return Buffer.concat([message.ne, message.ns, message.ciphertext])
}

export function encode2 (message: MessageBuffer): bytes {
  return Buffer.concat([message.ns, message.ciphertext])
}

export function decode0 (input: bytes): MessageBuffer {
  if (input.length < 32) {
    throw new Error('Cannot decode stage 0 MessageBuffer: length less than 32 bytes.')
  }

  return {
    ne: input.slice(0, 32),
    ciphertext: input.slice(32, input.length),
    ns: Buffer.alloc(0)
  }
}

export function decode1 (input: bytes): MessageBuffer {
  if (input.length < 80) {
    throw new Error('Cannot decode stage 1 MessageBuffer: length less than 80 bytes.')
  }

  return {
    ne: input.slice(0, 32),
    ns: input.slice(32, 80),
    ciphertext: input.slice(80, input.length)
  }
}

export function decode2 (input: bytes): MessageBuffer {
  if (input.length < 48) {
    throw new Error('Cannot decode stage 2 MessageBuffer: length less than 48 bytes.')
  }

  return {
    ne: Buffer.alloc(0),
    ns: input.slice(0, 48),
    ciphertext: input.slice(48, input.length)
  }
}
