# native-abort-controller

> Returns native AbortController/AbortSignal if available or the abort-controller module if not

An (almost) drop-in replacement for the `abort-controller` module that returns the native AbortController if available or the polyfill if not.

### Why?

Some environments such as the Electron Renderer process straddle the node/browser divide with features from both APIs available.  In these cases the webpack approach of always using the `browser` field in your `package.json` to override requires is too heavy-handed as sometimes you want to use the node version of an API.

Instead we can check for the availability of a given API and return it, rather than the node-polyfill for that API.

This module may become unecessary if [mysticatea/abort-controller#24](https://github.com/mysticatea/abort-controller/issues/24) is resolved.

## Install

You must install a version of `abort-controller` [alongside this module](https://docs.npmjs.com/files/package.json#peerdependencies) to be used if a native implementation is not available.

```console
$ npm install --save native-abort-controller abort-controller
```

## Usage

```javascript
import { AbortController } from 'native-abort-controller'

const controller = new AbortController()
const signal = controller.signal

signal.addEventListener('abort', () => {
    console.log('aborted!')
})

controller.abort()
```
