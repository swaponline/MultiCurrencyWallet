/**
 * canvas-renderer
 * https://github.com/dmester/canvas-renderer
 * 
 * Copyright (c) 2017-2018 Daniel Mester Pirttijärvi
 *
 * Permission is hereby granted, free of charge, to any person obtaining 
 * a copy of this software and associated documentation files (the 
 * "Software"), to deal in the Software without restriction, including 
 * without limitation the rights to use, copy, modify, merge, publish, 
 * distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject to 
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be 
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 
"use strict";

const zlib = require('zlib');
const PngBuffer = require("./pngBuffer");
const colorUtils = require("../colorUtils");

var SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function PngEncoder() {
    this._buffer = new PngBuffer();
    this._buffer.writeBuffer(SIGNATURE);
}

PngEncoder.prototype.writeImageHeader = function PngEncoder_writeImageHeader(width, height, colorType) {
    this._buffer.startChunk("IHDR");
    this._buffer.writeUInt32BE(width);
    this._buffer.writeUInt32BE(height);
    this._buffer.writeUInt8(8); // Bit depth
    this._buffer.writeUInt8(colorType);
    this._buffer.writeUInt8(0); // Compression
    this._buffer.writeUInt8(0); // Filter
    this._buffer.writeUInt8(0); // Interlace
    this._buffer.endChunk();
};

PngEncoder.prototype.writeImageGamma = function PngEncoder_writeImageGamma(gamma) {
    this._buffer.startChunk("gAMA");
    this._buffer.writeUInt32BE(gamma || 45455);
    this._buffer.endChunk();
};

PngEncoder.prototype.writeTrueColorWithAlpha = function PngEncoder_writeTrueColorWithAlpha(colorRanges, width, height) {
    this._buffer.startChunk("IDAT");

    var buffer = Buffer.alloc(width * height * 4 + height);
    var outputCursor = 0;
    var canvasCursor = 0;

    for (var y = 0; y < height; y++) {
        buffer.writeUInt8(0); // No filtering
        outputCursor++;

        for (var x = 0; x < width; canvasCursor++) {
            var count = colorRanges[canvasCursor * 2 + 0];

            // Use a bitwise operator to ensure the color is expressed as a signed 32-bit integer
            var color = colorRanges[canvasCursor * 2 + 1] & 0xffffffff;

            for (var i = 0; i < count; i++) {
                buffer.writeInt32BE(color, outputCursor);
                outputCursor += 4;
            }

            x += count;
        }
    }

    var compressed = zlib.deflateSync(buffer);
    this._buffer.writeBuffer(compressed);

    this._buffer.endChunk();
};

PngEncoder.prototype.writeIndexed = function PngEncoder_writeIndexed(colorRanges, palette, width, height) {
    this._buffer.startChunk("IDAT");

    var buffer = Buffer.alloc(width * height + height);
    var outputCursor = 0;
    var canvasCursor = 0;

    for (var y = 0; y < height; y++) {
        buffer.writeUInt8(0); // No filtering
        outputCursor++;

        for (var x = 0; x < width; canvasCursor++) {
            var count = colorRanges[canvasCursor * 2 + 0];
            var color = colorRanges[canvasCursor * 2 + 1];
            var colorIndex = palette.lookup[color];

            for (var i = 0; i < count; i++) {
                buffer.writeUInt8(colorIndex, outputCursor);
                outputCursor++;
            }

            x += count;
        }
    }

    var compressed = zlib.deflateSync(buffer);
    this._buffer.writeBuffer(compressed);

    this._buffer.endChunk();
};

PngEncoder.prototype.writePalette = function PngEncoder_writePalette(palette) {
    if (palette && palette.isValid) {
        this._buffer.startChunk("PLTE");

        for (var i = 0; i < palette.colors.length; i++) {
            this._buffer.writeUInt8(colorUtils.red(palette.colors[i]));
            this._buffer.writeUInt8(colorUtils.green(palette.colors[i]));
            this._buffer.writeUInt8(colorUtils.blue(palette.colors[i]));
        }

        this._buffer.endChunk();
    }
};

PngEncoder.prototype.writeTransparency = function PngEncoder_writeTransparency(palette) {
    if (palette && palette.isValid && palette.hasAlphaChannel) {
        this._buffer.startChunk("tRNS");

        for (var i = 0; i < palette.colors.length; i++) {
            this._buffer.writeUInt8(colorUtils.alpha(palette.colors[i]));
        }

        this._buffer.endChunk();
    }
};

PngEncoder.prototype.writeTextualData = function PngEncoder_writeTextualData(key, value) {
    this._buffer.startChunk("tEXt");
    this._buffer.writeString(key);
    this._buffer.writeUInt8(0);
    this._buffer.writeString(value);
    this._buffer.endChunk();
};

PngEncoder.prototype.writeImageEnd = function PngEncoder_writeImageEnd() {
    this._buffer.startChunk("IEND");
    this._buffer.endChunk();
};

PngEncoder.prototype.getBuffer = function PngEncoder_getBuffer() {
    return this._buffer.getBuffer();
};

PngEncoder.GRAYSCALE = 0;
PngEncoder.TRUE_COLOR = 2;
PngEncoder.INDEXED_COLOR = 3;
PngEncoder.GRAYSCALE_WITH_ALPHA = 4;
PngEncoder.TRUE_COLOR_WITH_ALPHA = 6;

module.exports = PngEncoder;
