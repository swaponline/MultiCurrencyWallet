# any-signal

[![Build Status](https://travis-ci.org/jacobheun/any-signal.svg?branch=master)](https://travis-ci.org/jacobheun/any-signal) [![dependencies Status](https://david-dm.org/jacobheun/any-signal/status.svg)](https://david-dm.org/jacobheun/any-signal) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Combines an array of AbortSignals into a single signal that is aborted when any signal is.

## Install

```
npm install any-signal
```

## Usage

```js
const AbortController = require('abort-controller')
const anySignal = require('any-signal')

const userController = new AbortController()
const timeoutController = new AbortController()

const combinedSignal = anySignal([userController.signal, timeoutController.signal])
combinedSignal.addEventListener('abort', () => console.log('Abort!'))

// Abort after 1 second
const timeoutId = setTimeout(() => timeoutController.abort(), 1000)

// The user or the timeout can now abort the action
await performSomeAction({ signal: combinedSignal })
clearTimeout(timeoutId)
```

## API

### `anySignal(signals)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| signals | Array<[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)> | The Signals that will be observed and mapped to the returned Signal |

#### Returns

| Type | Description |
|------|-------------|
| [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | A Signal that will be aborted as soon as any one of its parent signals are aborted. |

The returned [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) will only be aborted once, and as soon as one of its parent signals is aborted.

## Acknowledgements

The anySignal function is taken from a [comment by jakearchibald](https://github.com/whatwg/fetch/issues/905#issuecomment-491970649)

## LICENSE

[MIT](LICENSE) © Jacob Heun
