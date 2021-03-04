# it-pb-rpc

A convinience-wrapper arround protocol-buffers and lp-messages functions

# API

- `wrap(duplex, opts)`: Wraps a duplex, returns below object (opts=Object with encode/decode opts from [it-length-prefixed api](https://www.npmjs.com/package/it-length-prefixed#api))
  - `.read(bytes)`: async, reads the given amount of bytes
  - `.readLP()`: async, reads one length-prefixed message
  - `.readPB(proto)`: async, reads one protocol-buffers length-prefixed message (proto=Object with .encode, .decode functions)
  - `.write(data)`: writes the given data (data=Buffer or BufferList)
  - `.writeLP(data)`: writes the given data with a length-prefixe (data=Buffer or BufferList)
  - `.writePB(data, proto)`: encodes the data, then writes it withg a length-prefix (data=Buffer or BufferList, proto=Object with .encode, .decode functions)
  - `.pb(proto)`: returns a convinience wrapper for writing messages
    - `.read()`: reads one length-prefixed message encoded with `proto`
    - `.write(data)`: writes one length-prefixed message encoded with `proto`
