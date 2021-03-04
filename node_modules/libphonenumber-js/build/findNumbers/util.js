"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limit = limit;
exports.trimAfterFirstMatch = trimAfterFirstMatch;
exports.startsWith = startsWith;
exports.endsWith = endsWith;

/** Returns a regular expression quantifier with an upper and lower limit. */
function limit(lower, upper) {
  if (lower < 0 || upper <= 0 || upper < lower) {
    throw new TypeError();
  }

  return "{".concat(lower, ",").concat(upper, "}");
}
/**
 * Trims away any characters after the first match of {@code pattern} in {@code candidate},
 * returning the trimmed version.
 */


function trimAfterFirstMatch(regexp, string) {
  var index = string.search(regexp);

  if (index >= 0) {
    return string.slice(0, index);
  }

  return string;
}

function startsWith(string, substring) {
  return string.indexOf(substring) === 0;
}

function endsWith(string, substring) {
  return string.indexOf(substring, string.length - substring.length) === string.length - substring.length;
}
//# sourceMappingURL=util.js.map