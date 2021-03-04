# EventIterator: convert any JS event emitter to async iterators

## Highlights

`EventIterator` is a small module that greatly simplifies converting event
emitters, event targets, and similar objects into EcmaScript async iterators. It
works in browser and Node.js environments.

As a bonus you get utility functions:

  * `subscribe` to subscribe to events on a DOM event target with an async iterator
  * `stream` to consume data from a Node.js readable stream as an async iterator

## Basic examples

For client-side browser events:

``` javascript
import "core-js/es7/symbol" /* If necessary */
import {subscribe} from "event-iterator"
const element = document.querySelector("a.example")

for await (const click of subscribe.call(element, "click")) {
  /* Asynchronously iterate over click events on the element. */
}
```

For server-side Node.js events:

``` javascript
import "core-js/es7/symbol" /* If necessary */
import {stream} from "event-iterator"
const file = require("fs").createReadStream("example-file")

for await (const chunk of stream.call(file)) {
  /* Asynchronously iterate over buffer chunks read from file. */
}
```

## Advanced examples

Let's look at how `subscribe()` and `stream()` are implemented.

For client-side browser events:

``` javascript
import "core-js/es7/symbol" /* If necessary */
import {EventIterator} from "event-iterator"

export function subscribe(event, options) {
  /* "this" refers to a DOM event target. */
  return new EventIterator(
    ({push}) => {
      this.addEventListener(event, push, options)
      return () => this.removeEventListener(event, push, options)
    }
  )
}
```

For server-side Node.js events:

``` javascript
import "core-js/es7/symbol" /* If necessary */
import {EventIterator} from "event-iterator"

export function stream() {
  /* "this" refers to a Node.js readable stream. */
  return new EventIterator(
    queue => {
      this.addListener("data", queue.push)
      this.addListener("close", queue.stop)
      this.addListener("error", queue.fail)

      queue.on("highWater", () => this.pause())
      queue.on("lowWater", () => this.resume())

      return () => {
        this.removeListener("data", queue.push)
        this.removeListener("close", queue.stop)
        this.removeListener("error", queue.fail)
        this.destroy()
      }
    }
  )
}
```

### Backpressure

If you cannot reasonably consume all emitted events with your async iterator;
the internal `EventIterator` queue can fill up indefinitely.

A warning will be emitted when the queue reaches the high water mark (100 items
by default).

However, if you are able to control the event stream then you can listen to the
`highWater`, and `lowWater` events to exert backpressure.

When these events are emitted can be changed or disabled by setting
`highWaterMark` and `lowWaterMark` in the options of the `EventIterator`
constructor.

```js
import {EventIterator} from "event-iterator"

const eventIterator = new EventIterator(
  ({push, on}) => {
    const file = require("fs").createReadStream("example-file")
    file.on("data", push)
    on("highWater", () => file.pause())
    on("lowWater", () => file.resume())
    return () => file.removeListener("data", push)
  },
  {highWaterMark: 10, lowWaterMark: 5}
)
```


## API specification

Create a new event iterator with `new EventIterator(listen)`. This
object implements the async iterator protocol by having a `Symbol.asyncIterator`
property.

Note: you must set up any `Symbol.asyncIterator` polyfills **before** importing
`EventIterator`.

The `listen` handler is called every time a new iterator is created to set up
your event listeners. The optional `remove` handler is called when the event
listeners need to be removed. The `listen` handler returns the `remove`
handler, making it easy to call `addListener`/`removeListener` or similar
functions.

Type definitions:

``` typescript
export interface Queue<T> {
  push(value: T): void
  stop(): void
  fail(error: Error): void
  on(event: "highWater" | "lowWater", fn: () => void)
}

export type RemoveHandler = () => void
export type ListenHandler<T> = (queue: Queue<T>) => void | RemoveHandler

/* High water mark defaults to 100. Set to undefined to disable warnings. */
interface EventIteratorOptions = {
  highWaterMark?: number,
  lowWaterMark?: number,
}

class EventIterator<T> {
    constructor(ListenHandler<T>, options?: EventIteratorOptions)

    [Symbol.asyncIterator](): AsyncIterator<T>
}
```

## Background

The `EventIterator` class is an adapter to transform any browser or Node.js
event emitter into an async iterator that iterates over events.

Imagine you have a bunch of text files and in Node.js and you want to decide
whether they are longer or shorter than a certain number of lines. The files
should not be binary to avoid cluttering the results. To be more specific, we
want a function that will:

  * return `true` if the number of lines is 1000 or greater
  * return `false` if the number of lines is less than 1000
  * throw an exception if the file appears to be binary (contains NULL bytes)
  * returns as quickly as possible
  * conserves memory by not reading entire files at once

A naive solution would look like this:

``` javascript
function countLines(buffer) {
  const str = buffer.toString()
  if (str.match("\0")) throw new Error("Binary file!")
  return (str.match(/\n/g) || []).length
}

function isLongTextFile(file) {
  let lines = 1

  return new Promise((resolve, reject) => {
    file.on("data", chunk => {
      lines += countLines(chunk)
    })

    file.on("end", () => {
      resolve(lines >= 1000)
    })

    file.on("error", err => {
      reject(err)
    })
  })
}

isLongTextFile(fs.createReadStream("...")).then(console.log)
```

Unfortunately, this solution has some problems:

  * the entire file is read even if the file is way longer than 1000 lines
  * the entire file is read even if an exception occurs (a NULL byte was found)
  * multiple exceptions can be thrown if NULL bytes are found in multiple chunks

So we improve our solution, and we arrive at something like this:

``` javascript
function isLongTextFile(file) {
  let lines = 1

  const isLong = n => n >= 1000

  return new Promise((resolve, reject) => {
    file.on("data", chunk => {
      try {
        lines += countLines(chunk)
        if (isLong(lines)) {
          file.close()
          resolve(true)
        }
      } catch (err) {
        file.destroy()
        reject(err)
      }
    })

    file.on("end", () => {
      resolve(isLong(lines))
    })

    file.on("error", err => {
      reject(err)
    })
  })
}

isLongTextFile(fs.createReadStream("...")).then(console.log)
```

This works and we're happy to have solved the problem!

But what if there were a nicer way to do this? Async iterators sure seem like a
nice fit for this problem. They are a stage 3 EcmaScript proposal and can be
used by using TypeScript or Babel.

A similar solution using async iterators could look like this:

``` javascript
function async isLongTextFile(file) {
  let lines = 1
  for await (const chunk of stream.call(file)) { // or file::stream()
    lines += countLines(chunk)
    if (lines > 1000) return true
  }
  return false
}

isLongTextFile(fs.createReadStream("...")).then(console.log)
```

The question is: how do you create an async iterator from a readable stream?
Conceptually they are very similar; they both:

  * can signal that a next value is available
  * can signal when the end has been reached
  * can emit an error, after which no new values will become available

Async iterators have a few additional advantages that translate in simpler code:

  * early returns and exceptions will stop the iterator and release resources
  * exceptions in the iterator and in calling code can be handled without additional boilerplate

So how do you transform a readble stream into an async iterator? With an `EventIterator`.

We can define the `stream` function above as:

``` javascript
import {EventIterator} from "event-iterator"

function stream() {
  return new EventIterator(
    ({ push, stop, fail }) => {
      this.addListener("data", push)
      this.addListener("end", stop)
      this.addListener("error", fail)

      return () => {
        this.removeListener("data", push)
        this.removeListener("end", stop)
        this.removeListener("error", fail)
        this.destroy()
      }
    }
  )
}
```

The `EventIterator` takes care of:

  * conforming to the async iterator spec
  * returning placeholder promises to the async iterator if no value is available
  * queueing values when more data is ready than consumed by the iterator
  * installing callbacks to release resources so you can remove any listener handlers or do other cleanup

Why create an abstract `EventIterator` that requires you to define your own
integration code? Several reasons:

  * the event emitters as defined by Node.js have a different API than the event targets as defined in the DOM
  * the events that you are interested in may have different names depending on your use case
  * you may want to specify custom behaviour when the iterator throws or returns early

## Licensed under MIT license

Copyright (c) 2017-2020 Rolf Timmermans

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
