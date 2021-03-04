"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseDataUrl;

var _whatwgMimetype = _interopRequireDefault(require("whatwg-mimetype"));

var _abab = require("abab");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isASCIIHex(c) {
  return c >= 0x30 && c <= 0x39 || c >= 0x41 && c <= 0x46 || c >= 0x61 && c <= 0x66;
}

function percentDecodeBytes(input) {
  const output = new Uint8Array(input.byteLength);
  let outputIndex = 0;

  for (let i = 0; i < input.byteLength; ++i) {
    const byte = input[i];

    if (byte !== 0x25) {
      output[outputIndex] = byte;
    } else if (byte === 0x25 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
      output[outputIndex] = byte;
    } else {
      output[outputIndex] = parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16);
      i += 2;
    }

    outputIndex += 1;
  }

  return output.slice(0, outputIndex);
}

function parseDataUrl(stringInput) {
  let parsedUrl;

  try {
    parsedUrl = new URL(stringInput);
  } catch (error) {
    return null;
  }

  if (parsedUrl.protocol !== "data:") {
    return null;
  }

  parsedUrl.hash = ""; // `5` is value of `'data:'.length`

  const input = parsedUrl.toString().substring(5);
  let position = 0;
  let mimeType = "";

  while (position < input.length && input[position] !== ",") {
    mimeType += input[position];
    position += 1;
  }

  mimeType = mimeType.replace(/^[ \t\n\f\r]+/, "").replace(/[ \t\n\f\r]+$/, "");

  if (position === input.length) {
    return null;
  }

  position += 1;
  const encodedBody = input.substring(position);
  let body = Buffer.from(percentDecodeBytes(Buffer.from(encodedBody, "utf-8"))); // Can't use /i regexp flag because it isn't restricted to ASCII.

  const mimeTypeBase64MatchResult = /(.*); *[Bb][Aa][Ss][Ee]64$/.exec(mimeType);

  if (mimeTypeBase64MatchResult) {
    const stringBody = body.toString("binary");
    const asString = (0, _abab.atob)(stringBody);

    if (asString === null) {
      return null;
    }

    body = Buffer.from(asString, "binary");
    [, mimeType] = mimeTypeBase64MatchResult;
  }

  if (mimeType.startsWith(";")) {
    mimeType = `text/plain ${mimeType}`;
  }

  let mimeTypeRecord;

  try {
    mimeTypeRecord = new _whatwgMimetype.default(mimeType);
  } catch (e) {
    mimeTypeRecord = new _whatwgMimetype.default("text/plain;charset=US-ASCII");
  }

  return {
    mimeType: mimeTypeRecord,
    body
  };
}