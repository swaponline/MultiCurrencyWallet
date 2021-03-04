[![npm version](https://badge.fury.io/js/webpack-require-from.svg)](https://badge.fury.io/js/webpack-require-from)
[![npm](https://img.shields.io/npm/dm/webpack-require-from.svg)](https://www.npmjs.com/package/webpack-require-from)
[![CircleCI](https://circleci.com/gh/agoldis/webpack-require-from.svg?style=svg)](https://circleci.com/gh/agoldis/webpack-require-from)

# webpack-require-from

Control the dynamic imports path / URL at runtime

- Compatible with webpack 5, 4, 3, 2
- Supports web-workers loading (https://github.com/webpack-contrib/worker-loader)
- Production-ready
- No dependencies
- Lightweight
- Tested

## Table of contents

- [Why changing dynamic imports path at runtime?](#Why-changing-dynamic-imports-path-at-runtime)
- [How to use](#How-to-use)
- [Configuration](#configuration)
  - [`path`](#path)
  - [`variableName`](#variableName)
  - [`methodName`](#methodName)
  - [`replaceSrcMethodName`](#replaceSrcMethodName)
  - [`suppressErrors`](#suppressErrors)
- [Global methods and variables](#Global-methods-and-variables)
- [Web workers](#Web-Workers)
- [Troubleshooting](#Troubleshooting)
- [Tests](#tests)

# Why changing dynamic imports path at runtime?

Webpack allows to split and load code atomatically using [`require.ensure`](https://webpack.js.org/api/module-methods/#require-ensure) or [dynamic import](https://webpack.js.org/guides/code-splitting/#dynamic-imports) `import()`. Modules are fetched "on-demand" when your main bundle is running in browser.

Webpack loads the modules (chunks) from a static URL, which is determined by `config.output.publicPath` of [webpack configuration](https://webpack.js.org/guides/public-path/#on-the-fly).

Sometimes you need to control this modules (chunks) URL at runtime, for example:

- Chunks are hosted at a CDN
- Different environments use different URLs for loading assets (production, staging, qa)
- Your `index` file is served from a different location / port
- You need to dynamically load pre-compiled files from a different location
- You need to load 3rd part web worker from a CDN

# How to use

```javascript
// webpack.config.js
const WebpackRequireFrom = require("webpack-require-from");
const webpackRequireFromConfig = (module.exports = {
  output: {
    publicPath: "/webpack/"
  },
  plugins: [
    new WebpackRequireFrom({
      // see configuration options below
    })
  ]
});
```

# Configuration

If no options provided, the plugin will use the default [`config.output.publicPath`](https://webpack.js.org/guides/public-path/#on-the-fly). Check out the "example" directory.

## `path`

Set path for dynamically loading modules. The value you provide will replace `config.output.publicPath` when dynamically importing chunks.

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{path: "customPath/" }`, the chunk will be fetched from `https://localhost/customPath/0.js`

> **NOTE** `path`, `methodName`, `staticWindowVariableName` and `variableName` are mutualy exclusive and cannot be used together

## `variableName`

`variableName` is the globaly defined variable that will be evaluated at runtime, `variableName` is the name of a variable with string value that represents a path / URL that will be used for dynamically importing of chunks.

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{variableName: "chunkURL" }`, while `window.chunkURL` is defined to be:

```javascript
window.chunkURL = "https://app.cdn.com/buildXXX/";
```

the chunk will be fetched from `https://app.cdn.com/buildXXX/0.js`

## `staticWindowVariableName`

`staticWindowVariableName` is the globaly defined variable that will be evaluated at runtime, `staticWindowVariableName` is the name of a variable with string value that represents a path / URL that will be used for **static** importing of chunks.

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{staticWindowVariableName: "chunkURL" }`, while `window.chunkURL` is defined to be:

```javascript
window.chunkURL = "https://app.cdn.com/buildXXX/";
```

the chunk will be fetched from `https://app.cdn.com/buildXXX/0.js`

## `methodName`

Name of the globaly defined method that will be invoked at runtime, the method should return a path / URL that will be used for dynamically importing of chunks.

For example, if default URL is `https://localhost`, chunk name is `0.js` and options object is `{methodName: "getChunkURL" }`, while `window.getChunkURL` is defined to be:

```javascript
window.getChunkURL = function() {
  if (true) {
    // use any condition to choose the URL
    return "https://app.cdn.com/buildXXX/";
  }
};
```

the chunk will be fetched from `https://app.cdn.com/buildXXX/0.js`

If used together with `replaceSrcMethodName`, chunks URL will be first modified by `window[methodName]` and then, the modified values are passed as an argument to `window[replaceSrcMethodName]` function.

> **NOTE** `path`, `methodName`, `staticWindowVariableName` and `variableName` are mutualy exclusive and cannot be used together

> **NOTE** that the method should be defined in a global namespace and should be defined before `require.ensure` or `import()` is invoked. See examples below

## `replaceSrcMethodName`

Name of the globaly defined method that will be invoked at runtime; the method receives the **full URL** of the dynamically required chunk as its argument and should return a `string` with the new URL.

For example, if default URL is `https://localhost`, chunk names are `0.js` and `common.js`, options object is `{replaceSrcMethodName: "replaceSrc" }`, while `window.replaceSrc` is defined to be:

```javascript
window.replaceSrc = function(originalSrc) {
  if (originalSrc.match(/common/)) {
    // rename specific chunk
    return originalSrc.replace(/common/, "static");
  }
  return originalSrc;
};
```

the chunks will be fetched from `https://localhost/0.js` and `https://localhost/static.js`

If used together with `methodName` or `variableName`, chunks URL will be first modified by `window[methodName]` or will be modified to `window[variableName]` and then, the modified values are passed as an argument to `window[replaceSrcMethodName]` function.

> **NOTE** that the method should be defined in a global namespace and should be defined before `require.ensure` or `import()` is invoked.

## `suppressErrors`

`default: false`. The plugin will invoke `console.error` when the method name you defined in `replaceSrcMethodName`, `methodName` or `variableName` cannot be detected. Turning this option on will suppress the error messages.

# Global methods and variables

When your JS code is executed in browser, the variable/methods whose names you mention as `variableName`, `methodName` or `replaceSrcMethodName` value, should be set **before** the first call to `require.ensure()` or `import()` is executed.

The return value of the methods will be used to build the URL for fetching resources.

For example, let's define `veryFirst` method to be globally available before you main bundle is being executed.

Add the method definition at the very first line of you bundle:

```javascript
const window.veryFirst = function () {
 console.log("I am very first!");
}
```

You can use a separate file and use `webpack`'s [entry point list](https://webpack.js.org/configuration/entry-context/#entry):

```javascript
// filename: veryFirst.js
const window.veryFirst = function () {
 console.log("I am very first!");
}

// file webpack.config.js
module.exports = {
  entry: {
    ['./veryFirst.js', './index.js']
  }
}
```

Another approach is to define `veryFirst` as part of `index.html` when building it on your server:

```javascript
// filename: server/app.js
app.get("/", (req, res) =>
  res.render("views/index", {
    cdnPath: "https://qa.cdn.com/|https://prod.cdn.com/"
  })
);
```

```HTML
<!-- filename: views/index.ejs -->
<html>
<script>
  const baseCDN = "<%= cdnPath %>";
  window.veryFirst = function () {
      console.log(`${baseCDN}/js/`);
  }
</script>
...
</html>
```

# Web Workers

**TL;DR**

Use [`replaceSrcMethodName`](#replacesrcmethodname) to provide a method for modifying web-worker loading path. The method must be globally available and defined before `import()` calls within your web-worker. From `example` directory:

```javascript
/* webpack.config.js */
  // ...
  module: {
    rules: [
      {
        test: /worker\.js$/,
        use: {
          loader: `worker-loader`
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new RequireFrom({
      replaceSrcMethodName: "getSrc"
    })
  ]
  // ...


/* worker.js */
require("./globals.js");

import("./worker-module.js").then(workerModule => {
  workerModule.default();
  console.log("loaded workerModule");
});

```

**Details**

The plugin allows to change the loading path of web-workers.

Do to so, use the [`worker-loader`](https://github.com/webpack-contrib/worker-loader) loader. The loader uses [`importScripts`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) to dynamically load modules from within your web-worker and support [cross-domain web workers](https://benohead.com/cross-domain-cross-browser-web-workers/). More specifically it:

1.  Creates a new webpack entry that only contains `new Worker(workerURL)`, while `workerURL` is your main webworker module
2.  Enhances your webworker main module with webpack runtime utilities
3.  Uses `importScripts` to dynamically load new modules within webworker context (thus avoiding cross-domain limitations)

The plugin monkey-patches `importScripts` and invokes the method you've defined within [`replaceSrcMethodName`](#replacesrcmethodname) configuration option. The method you've provided will be invoked just before calling `importScripts` with the required module path as the single argument.

Check out the working example of using the plugin with web-workers at [web2fs-notepad](https://github.com/sushain97/web2fs-notepad/commit/06b3ece074f1c1c96d9bb75436181147943f6026#diff-028b78cada5fa9a59260b989f3b86ffeR52) by @sushain97.

# Troubleshooting

> `${methodName} is not a function or not available at runtime.`

- Make sure your method name in `webpack.config.js` matches the method name you define on global `window` object.

- Make sure the method is defined **before** the very first invocation of either `require.ensure()` or `import()`

> `Specify either "methodName" or "path", not together.`

- `path` and `methodName` are mutualy exclusive and cannot be used together, use either of them

> `'${methodName}' does not return string.`

- when using `replaceSrcMethodName` options the result of invoking `window[replaceSrcMethodName]` is validated - it
  should be defined and be a string

- make sure you return a string value from `window[replaceSrcMethodName]`

Don't hesitate to open issues.

# Tests

`yarn test`
