# native-fetch

> Returns native fetch/Request/Headers if available or the node-fetch module if not

An (almost) drop-in replacement for the `node-fetch` module that returns the native fetch if available or the polyfill if not.

### Why?

Some environments such as the Electron Renderer process straddle the node/browser divide with features from both APIs available.  In these cases the webpack approach of always using the `browser` field in your `package.json` to override requires is too heavy-handed as sometimes you want to use the node version of an API.

Instead we can check for the availability of a given API and return it, rather than the node-polyfill for that API.

## Install

You must install a version of `node-fetch` [alongside this module](https://docs.npmjs.com/files/package.json#peerdependencies) to be used if a native implementation is not available.

```console
$ npm install --save native-fetch node-fetch
```

## Usage

```javascript
const { default: fetch } = require('native-fetch')

fetch('https://github.com/')
    .then(res => res.text())
    .then(body => console.log(body))
```
