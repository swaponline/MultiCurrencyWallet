#!/usr/bin/env node

"use strict";

var zip = require("../lib/bestzip.js");

var argv = require("yargs")
  .usage("\nUsage: bestzip destination.zip sources/")
  .option("force", {
    describe: "Force use of node.js or native zip methods",
    choices: ["node", "native"]
  })
  .demand(2).argv;

var destination = argv._.shift();
var source = argv._;

console.log("Writing %s to %s...", source.join(", "), destination);

if (argv.force === "node") {
  zip = zip.nodeZip;
} else if (argv.force === "native") {
  zip = zip.nativeZip;
}

zip({
  source: source,
  destination: destination,
  verbose: argv.verbose
})
  .then(function() {
    console.log("zipped!");
  })
  .catch(function(err) {
    console.error(err);
    process.exit(1);
  });
