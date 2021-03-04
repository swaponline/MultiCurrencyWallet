# it-goodbye

[![Build Status](https://travis-ci.org/alanshaw/it-pipe.svg?branch=master)](https://travis-ci.org/alanshaw/it-goodbye)
[![dependencies Status](https://david-dm.org/alanshaw/it-pipe/status.svg)](https://david-dm.org/alanshaw/it-goodbye)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Add a goodbye handshake to a [duplex async iterable](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it).

In a uniplex stream, the end event signifies the end of the stream.
But a duplex stream, it's a little more complicated - there are two paired
streams that may end independently. node's net module has an
[allowHalfOpen](http://nodejs.org/api/net.html#net_new_net_socket_options)
mode, but support for this method is patchy - more often, by default
duplex streams are like a telephone - when one side hangs up, both streams are
terminated. Humans deal with this problem by moving stream termination
into the "application" layer - it's polite to say "goodbye", and to wait to receive
"goodbye" before call termination.

## Example

Given another duplex stream, wrap it with `it-goodbye`.
`goodbye(stream, goodbye_message)` takes a duplex stream and a message
(by default, the string `"GOODBYE"`), this must be encodable whatever codec
the stream uses. The codec should probably be applied outside of `it-goodbye`.

``` js
var goodbye = require('it-goodbye')

// a duplex stream from somewhere...
var duplex = whatever.createStream()

return goodbye(duplex, 'GoodBye')
```

## License

MIT
