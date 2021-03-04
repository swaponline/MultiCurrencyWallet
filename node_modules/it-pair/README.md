# it-pair

A pair of {source, sink} streams that are internally connected,
(what goes into the sink comes out the source)

This can be used to construct pipelines that are connected.

``` js
var pipe = require('it-pipe')
var pair = require('it-pair')

var p = pair()

//read values into this sink...
pipe([1, 2, 3], p.sink)

//but that should become the source over here.
const values = await pipe(p.source, async source => {
  const values = []
  for await (const value of source) {
    values.push(value)
  }
  return value
})

console.log(values) //[1, 2, 3]
```

This is particularly useful for creating duplex streams especially
around servers. Use `pull-pair/duplex` to get two duplex streams
that are attached to each other.

``` js
var DuplexPair = require('pull-pair/duplex')

var d = DuplexPair()

//the "client": pipe to the first duplex and get the response.
pipe(
  [1,2,3],
  d[0],
  source => {
    for await (value of source) {
      console.log(value) // => 10, 20, 30
    }
  }
)

//the "server": pipe from the second stream back to itself
//(in this case) appling a transformation.
pipe(
  d[1],
  source => (async function * () {
    for await (const e of source) {
      yield e*10
    }
  })(),
  d[1]
)
```

## License

MIT
