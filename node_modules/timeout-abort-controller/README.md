# timeout-abort-controller

[![Build Status](https://travis-ci.com/jacobheun/timeout-abort-controller.svg?branch=master)](https://travis-ci.com/jacobheun/timeout-abort-controller) [![dependencies Status](https://david-dm.org/jacobheun/timeout-abort-controller/status.svg)](https://david-dm.org/jacobheun/timeout-abort-controller) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> An AbortController that aborts after a specified timeout.

`timeout-abort-controller` uses [`retimer`](https://github.com/mcollina/retimer) internally to help reduce the impact of having numerous timers running.

## Install

```
npm install timeout-abort-controller
```

## Usage

```js
const AbortController = require('abort-controller')
const TimeoutController = require('timeout-abort-controller')
const anySignal = require('any-signal')

const userController = new AbortController()
// Aborts after 1 second
const timeoutController = new TimeoutController(1000)

const combinedSignal = anySignal([userController.signal, timeoutController.signal])
combinedSignal.addEventListener('abort', () => console.log('Abort!'))

// The user or the timeout can now abort the action
await performSomeAction({ signal: combinedSignal })
timeoutController.clear()
```

## API

### `new TimeoutController(ms)`

Creates an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) compliant `TimeoutController`.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| ms | number | The time in milliseconds for when the TimeoutController should abort |

### `timeoutController.clear()`

Clears the internal timer.

### `timeoutController.abort()`

Aborts the controller and clears the internal timeout.

### `timeoutController.reset()`

Clears the timer and sets the internal timeout to occur after the `ms` timeout it was created with.

## Related

- [`abort-controller`](https://github.com/mysticatea/abort-controller)
- [`any-signal`](https://github.com/jacobheun/any-signal) Combines an array of AbortSignals into a single signal.

## LICENSE

[MIT](LICENSE) © Jacob Heun
