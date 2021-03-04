// creates a zip file using either the native `zip` command if available,
// or a node.js zip implementation otherwise.

"use strict";

const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const archiver = require("archiver");
const async = require("async");
const glob = require("glob");
const which = require("which");

function hasNativeZip() {
  return Boolean(which.sync("zip", { nothrow: true }));
}

function expandSources(cwd, source, done) {
  // options to behave more like the native zip's glob support
  const globOpts = {
    cwd,
    dot: false, // ignore .dotfiles
    noglobstar: true, // treat ** as *
    noext: true, // no (a|b)
    nobrace: true // no {a,b}
  };
  // first handle arrays
  if (Array.isArray(source)) {
    return async.concat(
      source,
      (_source, next) => expandSources(cwd, _source, next),
      done
    );
  }
  // then expand magic
  if (typeof source !== "string") {
    throw new Error(`source is (${typeof source}) `);
  }
  if (glob.hasMagic(source, globOpts)) {
    // archiver uses this library but somehow ends up with different results on windows:
    // archiver.glob('*') will include subdirectories, but omit their contents on windows
    // so we'll use glob directly, and add all of the files it finds
    glob(source, globOpts, done);
  } else {
    // or just trigger the callback with the source string if there is no magic
    process.nextTick(() => {
      // always return an array
      done(null, [source]);
    });
  }
}

function walkDir(fullPath) {
  const files = fs.readdirSync(fullPath).map(f => {
    const filePath = path.join(fullPath, f);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return walkDir(filePath);
    }
    return filePath;
  });
  return files.reduce((acc, cur) => acc.concat(cur), []);
}

const nativeZip = options =>
  new Promise((resolve, reject) => {
    const cwd = options.cwd || process.cwd();
    const command = "zip";
    expandSources(cwd, options.source, (err, sources) => {
      const args = ["--quiet", "--recurse-paths", options.destination].concat(
        sources
      );
      const zipProcess = cp.spawn(command, args, {
        stdio: "inherit",
        cwd
      });
      zipProcess.on("error", reject);
      zipProcess.on("close", exitCode => {
        if (exitCode === 0) {
          resolve();
        } else {
          // exit code 12 means "nothing to do" right?
          //console.log('rejecting', zipProcess)
          reject(
            new Error(
              `Unexpected exit code from native zip: ${exitCode}\n executed command '${command} ${args.join(
                " "
              )}'\n executed in directory '${cwd}'`
            )
          );
        }
      });
    });
  });

// based on http://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js/18775083#18775083
const nodeZip = options =>
  new Promise((resolve, reject) => {
    const cwd = options.cwd || process.cwd();
    const output = fs.createWriteStream(path.resolve(cwd, options.destination));
    const archive = archiver("zip");

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    function addSource(source, next) {
      const fullPath = path.resolve(cwd, source);
      const destPath = source;
      fs.stat(fullPath, function(err, stats) {
        if (err) {
          return next(err);
        }
        if (stats.isDirectory()) {
          // Walk directory. Works on directories and directory symlinks.
          const files = walkDir(fullPath);
          files.forEach(f => {
            const subPath = f.substring(fullPath.length);
            archive.file(f, {
              name: destPath + subPath
            });
          });
        } else if (stats.isFile()) {
          archive.file(fullPath, { stats: stats, name: destPath });
        }
        next();
      });
    }

    expandSources(cwd, options.source, (err, expandedSources) => {
      if (err) {
        return reject(err);
      }
      async.forEach(expandedSources, addSource, err => {
        if (err) {
          return reject(err);
        }
        archive.finalize();
      });
    });
  });

function zip(options) {
  const compatMode = typeof options === "string";
  if (compatMode) {
    options = {
      source: arguments[1],
      destination: arguments[0]
    };
  }

  let promise;
  if (hasNativeZip()) {
    promise = nativeZip(options);
  } else {
    promise = nodeZip(options);
  }

  if (compatMode) {
    promise.then(arguments[2]).catch(arguments[2]);
  } else {
    return promise;
  }
}

module.exports = zip;
module.exports.zip = zip;
module.exports.nodeZip = nodeZip;
module.exports.nativeZip = nativeZip;
module.exports.bestzip = zip;
module.exports.hasNativeZip = hasNativeZip;
