# set-delayed-interval

[![Build Status](https://travis-ci.org/vasco-santos/set-delayed-interval.svg?branch=main)](https://travis-ci.org/vasco-santos/set-delayed-interval)
[![dependencies Status](https://david-dm.org/vasco-santos/set-delayed-interval/status.svg)](https://david-dm.org/vasco-santos/set-delayed-interval)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> An asynchronous setInterval that is properly delayed using promises and can be delayed on boot

## Motivation

The native implementation of `setInterval` expects synchronous functions to be executed. When asynchronous functions are provided, some unexpected behaviors might appear. This module mimics the `setInterval` native functionality with support for promises in a way that the interval timer is delayed by the execution of that promise. This results in equal stop times for each run, as soon as the promise is resolved.

For some scenarios, it is useful to add a start delay before running a recurrent task. This module also supports a custom delay before the interval starts. The `clearDelayedInterval` can stop both the initial delay and the interval.

## Install

```sh
npm i set-delayed-interval
```

## Usage

```js
const { setDelayedInterval, clearDelayedInterval } = require('set-delayed-interval')

const task = async () => {
  /// ....
}

// After 100ms, run the task recurrently with 50ms intervals
const id = setDelayedInterval(task, 50, 100)

// ...
clearDelayedInterval(id)
```


## API

### `setDelayedInterval`

#### Parameters

|  Name  | Type | Description |
|--------|------|-------------|
|  task  | `() => Promise` | recurrent task to run |
| interval | `number` | interval between each task (in ms) |
| [delay] | `number` | delay before first run (in ms). Defaults to `interval`. |

#### Returns

| Type | Description |
|------|-------------|
| `string` | interval id |

### `clearDelayedInterval`

#### Parameters

|  Name  | Type | Description |
|--------|------|-------------|
|  id  | `string` | interval id to clear |

## Error Handling

This module throws task errors on the global context. For handling your tasks errors, it is recommended to wrap the task async code with a `try catch` block, or your can catch the global errors with `process.once('uncaughtException', (err) => {})` in Node.js or `window.onerror = (err) => {}` in the browser.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/vasco-santos/set-delayed-interval/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Vasco Santos
