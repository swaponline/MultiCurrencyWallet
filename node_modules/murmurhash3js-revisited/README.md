JavaScript implementation of the [MurmurHash3](https://github.com/aappleby/smhasher) algorithms.

Forked from [pid/murmurhash3js](https://github.com/pid/murmurHash3js), the original implementation only uses the first byte from multi-byte character codes, potentially causing collisions and yielding different results from the reference implementation.

The signature of all three variants of the hash function have been changed; now
they expect bytes instead of strings. This increases the flexibility of the
library as it can now operate on e.g. strings with arbitrary encodings, numbers etc.

This requires the caller to convert from string to bytes before hashing. If the conversion from string to bytes was done internally, the library would
need to include at least a `TextEncoder` polyfill for utf-8 support and other
polyfills / hacks in order to have cross-browser support for other encodings.

### Installation

> npm install murmurhash3js

```javascript
    // browser
    <script type="text/javascript" src="murmurhash3js.min.js"></script>
    // server
    var murmurHash3 = require("murmurhash3js");
    // ES6 module
    import murmurHash3 from "murmurHash3js";
```

### Usage

Strings need to be decoded to bytes before being passed to the hash function. Passing strings without first converting to bytes will make the hash function operate directly on characters and yield incorrect results (e.g. `"a" << 8 !== 97 << 8`).

You can encode strings to utf8 bytes using `new TextEncoder().encode(str)` in modern browsers or `Buffer.from(str)` in node. If you need to support older browsers you can include a polyfill for TextEncoder.

The hash functions take two parameters: the input bytes and an optional seed for the hash function (defaults to 0).

```javascript
> const bytes = str => Buffer.from(str); // or new TextEncoder().encode(str)

// Return a 32bit hash as a unsigned int:
> murmurHash3.x86.hash32(bytes("I will not buy this record, it is scratched."))
  2832214938

> murmurHash3.x86.hash128(bytes("I will not buy this tobacconist's, it is scratched."))
  "9b5b7ba2ef3f7866889adeaf00f3f98e"
> murmurHash3.x64.hash128(bytes("I will not buy this tobacconist's, it is scratched."))
  "d30654abbd8227e367d73523f0079673"

// Specify a seed (defaults to 0):
> murmurHash3.x86.hash32(bytes("My hovercraft is full of eels."), 25)
  2520298415

// strings containing multi-byte character codes are handled correctly
> murmurHash3.x86.hash128(bytes("utf-8 supported 🌈"))
  "796479ed1bbff85b29e39731d1967a07"
```

### Matching against the reference implementation

In order to maintain compatibility with the original JS library this variant was forked from, the encoding of the output has not been changed. The 32bit version returns an unsigned int, while the x86 and x64 128 bit variants return 32 character hex strings.

Here's how you could print the output from the reference C++ implementation to get the same hex string as the JS library:

```c
int *ints = (int*) bytes;
for (int i = 0; i < 4; i++) {
  printf("%08x", ints[i]);
}
printf("\n");
```

For x64 this is different:

```c
uint64_t *ints = (uint64_t*) bytes;
for (int i = 0; i < 2; i++) {
  printf("%016llx", ints[i]);
}
printf("\n");
```

### Rebinding

```
> somethingCompletelyDifferent = murmurHash3.noConflict()
> murmurHash3
  undefined
> somethingCompletelyDifferent.version
  "3.0.1"
```

Authors
-------

-	[Karan Lyons](https://github.com/karanlyons/)
-	[Sascha Droste](https://github.com/pid/)
- [Alex Ciminian](https://github.com/cimi/)

Changlog
--------

[CHANGLELOG.md](https://github.com/cimi/murmurHash3js/blob/master/CHANGELOG.md)


### Other implementations


* https://github.com/karanlyons/murmurHash3.js

* https://github.com/garycourt/murmurhash-js
* https://github.com/kazuyukitanimura/murmurhash-js
* https://github.com/jensyt/imurmurhash-js
* https://github.com/matthewmueller/murmur.js
* https://github.com/ajoslin/murmurhash-v3

* https://github.com/saintplay/murmurhash

* https://github.com/levitation/murmurhash-js


* https://github.com/whitequark/murmurhash3-js

* https://github.com/vnykmshr/murmur-hash

* https://github.com/LinusU/murmur-128
* https://github.com/LinusU/array-buffer-from-string

```
 var view = new Uint16Array(length)

  for (var i = 0; i < length; i++) {
    view[i] = input.charCodeAt(i)
  }
```
Hashing char codes instead of utf-8 bytes?

* https://github.com/chriskr/murmurhash3_128
(no `package.json`, Uses textEncoder internally)

* https://github.com/aggregateknowledge/js-murmur3-128
(no package.json, has pom.xml, guava compat)
