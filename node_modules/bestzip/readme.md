# bestzip

[![Build status](https://travis-ci.org/nfriedly/node-bestzip.svg?branch=master)](https://travis-ci.org/nfriedly/node-bestzip)

This module provides a `bestzip` command that calls the native `zip` command if available and otherwise falls back to a
Node.js implementation.

The native `zip` method on macOS is significantly faster and more as efficient than the Node.js version, but Windows has no
native `zip` command. This module provides the best of both worlds.

The `--recurse-directories` (`-r`) option is automatically enabled.

## Global command line usage

    npm install -g bestzip
    bestzip destination.zip source/ [other sources...]

## Command line usage within `package.json` scripts

    npm install --save-dev bestzip

package.json:

```javascript
{
    //...
    "scripts": {
        "build" "...",
        "zip": "bestzip bundle.zip build/*",
        "upload": "....",
        "deploy": "npm run build && npm run zip && npm run upload"
    }
}
```

## Programmatic usage from within Node.js

```javascript
var zip = require('bestzip');

zip({
  source: 'build/*',
  destination: './destination.zip'
}).then(function() {
  console.log('all done!');
}).catch(function(err) {
  console.error(err.stack);
  process.exit(1);
});

// v1.x API also works for backwards compatibility: zip(destination, sources, callback)
```

### Options

* `source`: Path or paths to files and folders to include in the zip file. String or Array of Strings.
* `destination`: Path to generated .zip file.
* `cwd`: Set the Current Working Directory that source and destination paths are relative to. Defaults to `process.cwd()`

## How to control the directory structure

The directory structure in the .zip is going to match your input files. To have greater or fewer levels of directories.

For example:

`bestzip build.zip build/*`

This includes the build/ folder inside of the .zip

Alternatively:

`cd build/ && bestzip ../build.zip *`

This will not include the build/ folder, it's contents will be top-level.

When using the programmatic API, the same effect may be achieved by passing in the `cwd` option.

## .dotfiles

Wildcards ('*') ignore dotfiles.

* To include a dotfile, either include the directory it's in (`folder/`) or include it by name (`folder/.dotfile)`
* To omit dotfiles, either use a wildcard (`folder/*`) or explicitly list the desired files (`folder/file1.txt folder/file2.txt`)

## Breaking changes for v2

* `bestzip output.zip foo/bar/file.txt` now includes the foo/bar/ folders, previously it would place file.txt at the top-level
  * This was done to more closely align with the native zip command
