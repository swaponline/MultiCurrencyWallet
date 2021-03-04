"use strict"

// In node `export { TextEncoder }` throws:
// "Export 'TextEncoder' is not definedin module"
// To workaround we first define constants and then export with as.
const Encoder = TextEncoder
const Decoder = TextDecoder

export { Encoder as TextEncoder, Decoder as TextDecoder }
