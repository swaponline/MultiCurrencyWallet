'use strict'

const Benchmark = require('benchmark')
if (typeof window !== 'undefined') {
  window.Benchmark = Benchmark
}

const protobuf = require('protocol-buffers')
const protonsNpm = require('protons')
const protons = require('../')
const proto = require('./bench.proto')
const messages = protobuf(proto)
const messagesBuf = protons(proto)
const messagesNpm = protonsNpm(proto)
const uint8ArrayFromString = require('uint8arrays/from-string')

const EXAMPLE = {
  foo: 'hello',
  hello: 42,
  payload: uint8ArrayFromString('a'),
  meh: {
    b: {
      tmp: {
        baz: 1000
      }
    },
    lol: 'lol'
  }
}

const suite = new Benchmark.Suite()

function add (name, encode, decode) {
  const EXAMPLE_BUFFER = encode(EXAMPLE)

  suite
    .add(name + ' (encode)', function () {
      return encode(EXAMPLE)
    })
    .add(name + ' (decode)', function () {
      return decode(EXAMPLE_BUFFER)
    })
    .add(name + ' (encode + decode)', function () {
      return decode(encode(EXAMPLE))
    })
}

add('JSON', JSON.stringify, JSON.parse)
add(`protocol-buffers@${require('protocol-buffers/package.json').version}`, messages.Test.encode, messages.Test.decode)
add(`protons@${require('protons/package.json').version}`, messagesNpm.Test.encode, messagesNpm.Test.decode)
add('local', messagesBuf.Test.encode, messagesBuf.Test.decode)

suite
  .on('cycle', (e) => {
    console.log(String(e.target))
  })
  .run()
