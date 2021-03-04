const { Writable, pipeline } = require('stream')

// Promisified pipeline
function pipe (...streams) {
  return new Promise((resolve, reject) => {
    pipeline(...streams, err => {
      // work around bug in node to make 'should end mid stream' test pass - https://github.com/nodejs/node/issues/23890
      if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') return reject(err)
      resolve()
    })
  })
}

exports.pipe = pipe

// Pipe a bunch of streams together and collect the results
exports.collect = async (...streams) => {
  const chunks = []
  const collector = new Writable({
    write (chunk, enc, cb) {
      chunks.push(chunk)
      cb()
    }
  })

  await pipe(...[...streams, collector])
  return chunks
}
