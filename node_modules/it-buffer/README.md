# it-buffer

Is it a string? Is it a BufferList? Or just a Buffer? Worry no more with `it-buffer`!

It exposes a transform stream that converts all buffer-like objects into true buffers

# Usage

```js
const pipe = require('it-pipe')

pipe(
  src,
  require('it-buffer'),
  dst
)
```

Also exposes `.toBuffer()` (the same as above) and `.toList()` (returns BufferLists instead of Buffers)
