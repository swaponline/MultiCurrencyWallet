# streaming-iterables 🏄‍♂️

[![Node CI](https://github.com/reconbot/streaming-iterables/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/reconbot/streaming-iterables/actions?query=workflow%3A%22Node+CI%22) [![Try streaming-iterables on RunKit](https://badge.runkitcdn.com/streaming-iterables.svg)](https://npm.runkit.com/streaming-iterables) [![install size](https://packagephobia.now.sh/badge?p=streaming-iterables)](https://packagephobia.now.sh/result?p=streaming-iterables)

A Swiss army knife for [async iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). Designed to help replace your streams. These utilities have a comparable speed, friendlier error handling, and are easier to understand than most stream based workloads.

Streams were our last best hope for processing unbounded amounts of data. Now with Node 10 they have become something greater, they've become async iterable. With async iterators you can have less code, do more work, faster.

If you still need streams with async functions, check out sister project [`bluestream`🏄‍♀️](https://www.npmjs.com/package/bluestream)!

## Install
There are no dependencies.

```bash
npm install streaming-iterables
```

We ship esm, umd and types.

## Overview
Every function is curryable, you can call it with any number of arguments. For example:

```ts
import { map } from 'streaming-iterables'

for await (const str of map(String, [1,2,3])) {
  console.log(str)
}
// "1", "2", "3"

const stringable = map(String)
for await (const str of stringable([1,2,3])) {
  console.log(str)
}
// "1", "2", "3"
```

Since this works with async iterators it requires node 10 or higher.

## API

- [`batch()`](#batch)
- [`buffer()`](#buffer)
- [`collect()`](#collect)
- [`concat()`](#concat)
- [`consume()`](#consume)
- [`flatMap()`](#flatmap)
- [`flatten()`](#flatten)
- [`flatTransform()`](#flattransform)
- [`fromStream()`](#fromstream)
- [`filter()`](#filter)
- [`getIterator()`](#getiterator)
- [`map()`](#map)
- [`merge()`](#merge)
- [`parallelMap()`](#parallelmap)
- [`parallelMerge()`](#parallelmerge)
- [`pipeline()`](#pipeline)
- [`reduce()`](#reduce)
- [`take()`](#take)
- [`tap()`](#tap)
- [`time()`](#time)
- [`transform()`](#transform)
- [`writeToStream()`](#writetostream)

### batch
```ts
function batch<T>(size: number, iterable: AsyncIterable<T>): AsyncGenerator<T[]>
function batch<T>(size: number, iterable: Iterable<T>): Generator<T[]>
```

Batch objects from `iterable` into arrays of `size` length. The final array may be shorter than size if there is not enough items. Returns a sync iterator if the `iterable` is sync, otherwise an async iterator. Errors from the source `iterable` are immediately raised.

`size` can be between 1 and `Infinity`.

```ts
import { batch } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

// batch 10 pokemon while we process them
for await (const pokemons of batch(10, getPokemon())) {
  console.log(pokemons) // 10 pokemon at a time!
}
```

### buffer
```ts
function buffer<T>(size: number, iterable: AsyncIterable<T>): AsyncIterable<T>
function buffer<T>(size: number, iterable: Iterable<T>): AsyncIterable<T>
```
Buffer keeps a number of objects in reserve available for immediate reading. This is helpful with async iterators as it will pre-fetch results so you don't have to wait for them to load. For sync iterables it will pre-compute up to `size` values and keep them in reserve. The internal buffer will start to be filled once `.next()` is called for the first time and will continue to fill until the source `iterable` is exhausted or the buffer is full. Errors from the source `iterable` will be raised after all buffered values are yielded.

`size` can be between 0 and `Infinity`.

```ts
import { buffer } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

// load 10 monsters in the background while we process them one by one
for await (const monster of buffer(10, getPokemon())) {
  await trainMonster(monster) // got to do some pokéwork
}
```

### collect
```ts
function collect<T>(iterable: Iterable<T>): T[]
function collect<T>(iterable: AsyncIterable<T>): Promise<T[]>
```

Collect all the values from an iterable into an array. Returns an array if you pass it an iterable and a promise for an array if you pass it an async iterable. Errors from the source `iterable` are raised immediately.

```ts
import { collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

console.log(await collect(getPokemon()))
// [bulbasaur, ivysaur, venusaur, charmander, ...]
```

### concat
```ts
function concat(...iterables: Array<Iterable<any>>): Iterable<any>
function concat(...iterables: Array<AnyIterable<any>>): AsyncIterable<any>
```

Combine multiple iterators into a single iterable. Reads each iterable completely one at a time. Returns a sync iterator if all `iterables` are sync, otherwise it returns an async iterable. Errors from the source `iterable` are raised immediately.

```ts
import { concat } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { getTransformers } from './util'

for await (const hero of concat(getPokemon(2), getTransformers(2))) {
  console.log(hero)
}
// charmander
// bulbasaur <- end of pokemon
// megatron
// bumblebee <- end of transformers
```

### consume
```ts
export function consume<T>(iterable: Iterable<T>): void
export function consume<T>(iterable: AsyncIterable<T>): Promise<void>
```

A promise that resolves after the function drains the iterable of all data. Useful for processing a pipeline of data. Errors from the source `iterable` are raised immediately.

```ts
import { consume, map } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

const train = map(trainMonster)
await consume(train(getPokemon())) // load all the pokemon and train them!
```

### flatMap
```ts
function flatMap<T, B>(func: (data: T) => FlatMapValue<B>, iterable: AnyIterable<T>): AsyncGenerator<B>
```

Map `func` over the `iterable`, flatten the result and then ignore all null or undefined values. It's the transform function we've always needed. It's equivalent to;
```ts
(func, iterable) => filter(i => i !== undefined && i !== null, flatten(map(func, iterable)))
```

*note*: The return value for `func` is `FlatMapValue<B>`. Typescript doesn't have recursive types but you can nest iterables as deep as you like.

The ordering of the results is guaranteed. Errors from the source `iterable` are raised after all mapped values are yielded. Errors from `func` are raised after all previously mapped values are yielded.

```ts
import { flatMap } from 'streaming-iterables'
import { getPokemon, lookupStats } from 'iterable-pokedex'

async function getDefeatedGyms(pokemon) {
  if (pokemon.gymBattlesWon > 0) {
    const stats = await lookupStats(pokemon)
    return stats.gyms
  }
}

for await (const gym of flatMap(getDefeatedGyms, getPokemon())) {
  console.log(gym.name)
}
// "Pewter Gym"
// "Cerulean Gym"
// "Vermilion Gym"
```

### flatten
```ts
function flatten<B>(iterable: AnyIterable<B | AnyIterable<B>>): AsyncIterableIterator<B>
```

Returns a new iterator by pulling every item out of `iterable` (and all its sub iterables) and yielding them depth-first. Checks for the iterable interfaces and iterates it if it exists. If the value is a string it is not iterated as that ends up in an infinite loop. Errors from the source `iterable` are raised immediately.

*note*: Typescript doesn't have recursive types but you can nest iterables as deep as you like.

```ts
import { flatten } from 'streaming-iterables'

for await (const item of flatten([1, 2, [3, [4, 5], 6])) {
  console.log(item)
}
// 1
// 2
// 3
// 4
// 5
// 6
```

### flatTransform
```ts
function flatTransform<T, R>(concurrency: number, func: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
```

Map `func` over the `iterable`, flatten the result and then ignore all null or undefined values. Returned async iterables are flattened concurrently too. It's the transform function we've always wanted.

It's similar to;
```ts
const filterEmpty = filter(i => i !== undefined && i !== null)
(concurrency, func, iterable) => filterEmpty(flatten(transform(concurrency, func, iterable)))
```


*note*: The return value for `func` is `FlatMapValue<B>`. Typescript doesn't have recursive types but you can nest iterables as deep as you like. However only directly returned async iterables are processed concurrently. (Eg, if you use an async generator function as `func` it's output will be processed concurrently, but if it's nested inside other iterables it will be processed sequentially.)

Order is determined by when async operations resolve. And it will run up to `concurrency` async operations at once. This includes promises and async iterables returned from `func`. Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.

Promise Example;
```ts
import { flatTransform } from 'streaming-iterables'
import { getPokemon, lookupStats } from 'iterable-pokedex'

async function getDefeatedGyms(pokemon) {
  if (pokemon.gymBattlesWon > 0) {
    const stats = await lookupStats(pokemon)
    return stats.gyms
  }
}

// lookup 10 stats at a time
for await (const gym of flatTransform(10, getDefeatedGyms, getPokemon())) {
  console.log(gym.name)
}
// "Pewter Gym"
// "Cerulean Gym"
// "Vermilion Gym"
```

Async Generator Example
```ts
import { flatTransform } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { findFriendsFB, findFriendsMySpace } from './util'


async function* findFriends (pokemon) {
  yield await findFriendsFB(pokemon.name)
  yield await findFriendsMySpace(pokemon.name)
}

for await (const pokemon of flatTransform(10, findFriends, getPokemon())) {
  console.log(pokemon.name)
}
// Pikachu
// Meowth
// Ash - FB
// Jessie - FB
// Misty - MySpace
// James - MySpace
```

### fromStream
```ts
function fromStream<T>(stream: Readable): AsyncIterable<T>
```

If you are on a node before node 10, you will have to use `fromStream` to turn the stream into an async iterator. If this function is used and the stream already has one, the one already present on the stream is used. This is recommended for backwards compatibility.

```ts
import { fromStream } from 'streaming-iterables'
import { createReadStream } from 'fs'

const pokeLog = fromStream(createReadStream('./pokedex-operating-system.log'))

for await (const pokeData of pokeLog) {
  console.log(pokeData) // Buffer(...)
}
```

### filter
```ts
function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): AsyncIterableIterator<T>
```

Takes a `filterFunc` and a `iterable`, and returns a new async iterator of the same type containing the members of the given iterable which cause the `filterFunc` to return true.

```ts
import { filter } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const filterWater = filter(pokemon => pokemon.types.include('Water'))

for await (const pokemon of filterWater(getPokemon())) {
  console.log(pokemon)
}
// squirtle
// vaporeon
// magikarp
```

### getIterator
```ts
function getIterator<T>(values: Iterableish<T>): Iterator<T> | AsyncIterator<T>
```

Get the iterator from any iterable or just return an iterator itself.

### map
```ts
function map<T, B>(func: (data: T) => B | Promise<B>, iterable: AnyIterable<T>): AsyncIterableIterator<B>
```
Map a function or async function over all the values of an iterable. Errors from the source `iterable` and `func` are raised immediately.

```ts
import { consume, map } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = map(got)

// download one at a time
for await (page of download(urls)) {
  console.log(page)
}
```

### merge
```ts
function merge(...iterables: Array<AnyIterable<any>>): AsyncIterableIterator<any>
```

Combine multiple iterators into a single iterable. Reads one item off each iterable in order repeatedly until they are all exhausted. If you care less about order and want them faster see [`parallelMerge()`](#parallelmerge).

### parallelMap
```ts
function parallelMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
```

Map a function or async function over all the values of an iterable and do them concurrently. Errors from the source `iterable` are raised after all mapped values are yielded. Errors from `func` are raised after all previously mapped values are yielded. Just like [`map()`](#map).

`concurrency` can be between 1 and `Infinity`.

If you don't care about order, see the faster [`transform()`](#transform) function.

```ts
import { consume, map } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = map(2, got)

// download two at a time
for await (page of download(urls)) {
  console.log(page)
}
```

### parallelMerge
```ts
function parallelMerge<T>(...iterables: Array<AnyIterable<T>>): AsyncIterableIterator<T>
```
Combine multiple iterators into a single iterable. Reads one item off of every iterable and yields them as they resolve. This is useful for pulling items out of a collection of iterables as soon as they're available. Errors `iterables` are raised immediately.

```ts
import { parallelMerge } from 'streaming-iterables'
import { getPokemon, getTransformer } from 'iterable-pokedex'

// pokemon are much faster to load btw
const heros = parallelMerge(getPokemon(), getTransformer())
for await (const hero of heros) {
  console.log(hero)
}
// charmander
// bulbasaur
// megatron
// pikachu
// eevee
// bumblebee
// jazz
```

### pipeline
```ts
function pipeline(firstFn: Function, ...fns: Function[]): any;
```

Calls `firstFn` and then every function in `fns` with the result of the previous function. The final return is the result of the last function in `fns`.

```ts
import { pipeline, map, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
const getName = map(pokemon => pokemon.name)

// equivalent to `await collect(getName(getPokemon()))`
await pipeline(getPokemon, getName, collect)
// charmander
// bulbasaur
// MissingNo.
```

### reduce
```ts
function reduce<T, B>(func: (acc: B, value: T) => B, start: B, iterable: AnyIterable<T>): Promise<B>
```

An async function that takes a reducer function, an initial value and .

Reduces an iterable to a value which is the accumulated result of running each value from the iterable thru `func`, where each successive invocation is supplied the return value of the previous. Errors are immediate raised.

### take
```ts
function take<T>(count: number, iterable: AsyncIterable<T>): AsyncIterableIterator<T>
function take<T>(count: number, iterable: Iterable<T>): IterableIterator<T>
```
Returns a new iterator that reads a specific number of items from `iterable`. When used with generators it advances the generator, when used with arrays it gets a new iterator and starts from the beginning.

### tap
```ts
function tap<T>(func: (data: T) => any, iterable: AnyIterable<T>): AsyncIterableIterator<T>
```

Returns a new iterator that yields the data it consumes passing the data through to a function. If you provide an async function the iterator will wait for the promise to resolve before yielding the value. This is useful for logging, or processing information and passing it along.

### time
```ts
function time<T>(config?: ITimeConfig, iterable: AsyncIterable<R>): AsyncIterableIterator<R>
function time<T>(config?: ITimeConfig, iterable: Iterable<R>): IterableIterator<R>

interface ITimeConfig {
    progress?: (delta: [number, number], total: [number, number]) => any;
    total?: (time: [number, number]) => any;
}
```
Returns a new iterator that yields the data it consumes and calls the `progress` and `total` callbacks with the [`hrtime`](https://nodejs.org/api/process.html#process_process_hrtime_time) it took for `iterable` to provide a value when `.next()` was called on it. That is to say, the time returned is the time this iterator spent waiting for data, not the time it took to finish being read. The `hrtime` tuple looks like `[seconds, nanoseconds]`.


```ts
import { consume, transform, time } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = transform(1000, got)
const timer = time({
  total: total => console.log(`Spent ${total[0]} seconds and ${total[1]}ns downloading cats`),
})
// download all of these at the same time
for await (page of timer(download(urls))) {
  console.log(page)
}

```
### transform
```ts
function transform<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
```
Map a function or async function over all the values of an iterable. Order is determined by when `func` resolves. And it will run up to `concurrency` async `func` operations at once. If you care about order see [`parallelMap()`](#parallelmap). Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.

```ts
import { consume, transform } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = transform(1000, got)

// download all of these at the same time
for await (page of download(urls)) {
  console.log(page)
}
```

### writeToStream
```ts
function writeToStream(stream: Writable, iterable: AnyIterable<any>): Promise<void>
```

Writes the `iterable` to the stream respecting the stream back pressure. Resolves when the iterable is exhausted, rejects if the stream errors during calls to `write()` or if there are `error` events during the write.

As it is when working with streams there are a few caveats;
- It is possible for the stream to error after `writeToStream()` has finished writing due to internal buffering and other concerns, so always handle errors on the stream as well.
- `writeToStream()` doesn't close the stream like `stream.pipe()` might. This is done so you can write to the stream multiple times. You can call `stream.write(null)` or any stream specific end function if you are done with the stream.

```ts
import { pipeline, map, writeToStream } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { createWriteStream } from 'fs'

const file = createWriteStream('pokemon.ndjson')
const serialize = map(pokemon => `${JSON.stringify(pokemon)}\n`)
await pipeline(getPokemon, serialize, writeToStream(file))
file.end() // close the stream
// now all the pokemon are written to the file!
```

## Types

### Iterableish
```ts
type Iterableish<T> = Iterable<T> | Iterator<T> | AsyncIterable<T> | AsyncIterator<T>
```
Any iterable or iterator.

### AnyIterable
```ts
type AnyIterable<T> = Iterable<T> | AsyncIterable<T>
```
Literally any `Iterable` (async or regular).

### FlatMapValue
```ts
type FlatMapValue<B> = B | AnyIterable<B> | undefined | null | Promise<B | AnyIterable<B> | undefined | null>
```
A value, an array of that value, undefined, null or promises for any of them. Used in the `flatMap` and `flatTransform` functions as possible return values of the mapping function.

## Contributors wanted!

Writing docs and code is a lot of work! Thank you in advance for helping out.
