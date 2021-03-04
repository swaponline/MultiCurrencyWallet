# interface-datastore <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/interface-datastore.svg?style=flat-square)](https://codecov.io/gh/ipfs/interface-datastore)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ipfs/interface-datastore/ci?label=ci&style=flat-square)](https://github.com/ipfs/interface-datastore/actions?query=branch%3Amaster+workflow%3Aci+)

> Implementation of the [datastore](https://github.com/ipfs/go-datastore) interface in JavaScript

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](https://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

- [Implementations](#implementations)
- [Adapter](#adapter)
- [Install](#install)
- [Usage](#usage)
  - [Wrapping Stores](#wrapping-stores)
  - [Test suite](#test-suite)
  - [Aborting requests](#aborting-requests)
  - [Concurrency](#concurrency)
  - [Keys](#keys)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Implementations

- Backed Implementations
  - Memory: [`src/memory`](src/memory.js)
  - level: [`datastore-level`](https://github.com/ipfs/js-datastore-level) (supports any levelup compatible backend)
  - File System: [`datstore-fs`](https://github.com/ipfs/js-datastore-fs)
- Wrapper Implementations
  - Mount: [`datastore-core/src/mount`](https://github.com/ipfs/js-datastore-core/tree/master/src/mount.js)
  - Keytransform: [`datstore-core/src/keytransform`](https://github.com/ipfs/js-datastore-core/tree/master/src/keytransform.js)
  - Sharding: [`datastore-core/src/sharding`](https://github.com/ipfs/js-datastore-core/tree/master/src/sharding.js)
  - Tiered: [`datstore-core/src/tiered`](https://github.com/ipfs/js-datastore-core/blob/master/src/tiered.js)
  - Namespace: [`datastore-core/src/namespace`](https://github.com/ipfs/js-datastore-core/tree/master/src/namespace.js)

If you want the same functionality as [go-ds-flatfs](https://github.com/ipfs/go-ds-flatfs), use sharding with fs.

```js
const FsStore = require('datastore-fs')
const ShardingStore = require('datastore-core').ShardingDatatstore
const NextToLast = require('datastore-core').shard.NextToLast

const fs = new FsStore('path/to/store')

// flatfs now works like go-flatfs
const flatfs = await ShardingStore.createOrOpen(fs, new NextToLast(2))
```

## Adapter

An adapter is made available to make implementing your own datastore easier:

```javascript
const { Adapter } = require('interface-datastore')

class MyDatastore extends Adapter {
  constructor () {
    super()
  }

  async put (key, val) {
    // your implementation here
  }

  async get (key) {
    // your implementation here
  }

  // etc...
}
```

See the [MemoryDatastore](./src/memory.js) for an example of how it is used.

## Install

```sh
$ npm install interface-datastore
```

## Usage

### Wrapping Stores

```js
const MemoryStore = require('interface-datastore').MemoryDatastore
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key

const store = new MountStore({ prefix: new Key('/a'), datastore: new MemoryStore() })
```

### Test suite

Available under [`src/tests.js`](src/tests.js)

```js
describe('mystore', () => {
  require('interface-datastore/src/tests')({
    async setup () {
      return instanceOfMyStore
    },
    async teardown () {
      // cleanup resources
    }
  })
})
```

### Aborting requests

Most API methods accept an [AbortSignal][] as part of an options object.  Implementations may listen for an `abort` event emitted by this object, or test the `signal.aborted` property. When received implementations should tear down any long-lived requests or resources created.

### Concurrency

The streaming `(put|get|delete)Many` methods are intended to be used with modules such as [it-parallel-batch](https://www.npmjs.com/package/it-parallel-batch) to allow calling code to control levels of parallelisation.  The batching method ensures results are returned in the correct order, but interface implementations should be thread safe.

```js
const batch = require('it-parallel-batch')
const source = [{
  key: ..,
  value: ..
}]

// put values into the datastore concurrently, max 10 at a time
for await (const { key, data } of batch(store.putMany(source), 10)) {
  console.info(`Put ${key}`)
}
```

### Keys

To allow a better abstraction on how to address values, there is a `Key` class which is used as identifier. It's easy to create a key from a `Uint8Array` or a `string`.

```js
const a = new Key('a')
const b = new Key(new Uint8Array([0, 1, 2, 3]))
```

The key scheme is inspired by file systems and Google App Engine key model. Keys are meant to be unique across a system. They are typically hierarchical, incorporating more and more specific namespaces. Thus keys can be deemed 'children' or 'ancestors' of other keys:

- `new Key('/Comedy')`
- `new Key('/Comedy/MontyPython')`

Also, every namespace can be parameterized to embed relevant object information. For example, the Key `name` (most specific namespace) could include the object type:

- `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`

## API
https://ipfs.github.io/interface-datastore/

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS


[Key]: #Keys
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[AsyncIterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator
[AsyncIterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean