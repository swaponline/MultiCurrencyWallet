# retimer&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/retimer.png)](https://travis-ci.org/mcollina/retimer)

reschedulable setTimeout for you node needs. This library is built for
building a keep alive functionality across a large numbers of
clients/sockets.

Rescheduling a 10000 functions 20 times with an interval of 50ms (see
`bench.js`), with 100 repetitions:

* `benchSetTimeout*100: 36912.680ms`
* `benchRetimer*100: 33213.134ms`

## Install

```
npm install retimer --save
```

## Example

```js
var retimer = require('retimer')
var timer = retimer(function () {
  throw new Error('this should never get called!')
}, 20)

setTimeout(function () {
  timer.reschedule(50)
  setTimeout(function () {
    timer.clear()
  }, 10)
}, 10)
```

## API

### retimer(callback, timeout, [...args])

Exactly like your beloved `setTimeout`.
Returns a `Retimer object`

### timer.reschedule(timeout)

Reschedule the timer, if the specified timeout comes __after__ the
original timeout.

Returns true if successful, false otherwise

### timer.clear()

Clear the timer, like your beloved `clearTimeout`.

## How it works

Timers are stored in a Linked List in node.js, if you create a lot of
timers this Linked List becomes massive which makes __removing a timer an expensive operation__.
Retimer let the old timer run at its time, and schedule a new one accordingly.

## License

MIT
