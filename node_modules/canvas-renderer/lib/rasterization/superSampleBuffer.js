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

const colorUtils = require("../colorUtils");

const IDX_COUNT = 0;
const IDX_A = 1;
const IDX_R = 2;
const IDX_G = 3;
const IDX_B = 4;

/**
 * Creates a color buffer keeping an average color out of several
 * color samples per pixel.
 * @param {number} width  Width of the buffer in pixels.
 * @param {number} samplesPerPixel  Number of samples to keep per pixel.
 */
function SuperSampleBuffer(width, samplesPerPixel) {
    this._samples = new Uint16Array(width * 5); 
    this._samplesPerPixel = samplesPerPixel;

    this._pixelOffset = 0;
    this._subPixelOffset = 0;
}

/**
 * Adds a color to the current pixel in the buffer.
 * @param {number} count  Number of samples of the color to be added to the buffer.
 * @private
 */
SuperSampleBuffer.prototype._add = function SuperSampleBuffer_add(count, a, r, g, b) {
    this._samples[this._pixelOffset * 5 + IDX_COUNT] += count;

    if (a > 0) {
        this._samples[this._pixelOffset * 5 + IDX_A] += 0 | (a * count);
        this._samples[this._pixelOffset * 5 + IDX_R] += 0 | (r * count * a / 255);
        this._samples[this._pixelOffset * 5 + IDX_G] += 0 | (g * count * a / 255);
        this._samples[this._pixelOffset * 5 + IDX_B] += 0 | (b * count * a / 255);
    }
};

/**
 * Rewinds the cursor to the beginning of the buffer.
 */
SuperSampleBuffer.prototype.rewind = function SuperSampleBuffer_rewind() {
    this._pixelOffset = 0;
    this._subPixelOffset = 0;
};

/**
 * Clears the samples in this buffer.
 */
SuperSampleBuffer.prototype.clear = function SuperSampleBuffer_clear() {
    this._pixelOffset = 0;
    this._subPixelOffset = 0;

    this._samples.fill(0);
};

/**
 * Writes the average color of each pixel to a specified BitmapWriter.
 * @param {BitmapWriter} bitmapWriter  The average colors will be written to this BitmapWriter.
 * @param {number} count  Number of pixels to write.
 */
SuperSampleBuffer.prototype.writeTo = function SuperSampleBuffer_writeTo(bitmapWriter, count) {
    for (var i = 0; i < count; i++) {
        var sampleCount = this._samples[i * 5 + IDX_COUNT],
            alphaSum = this._samples[i * 5 + IDX_A],
            color = sampleCount && alphaSum ? 
                colorUtils.from(
                    Math.floor(alphaSum / sampleCount),
                    Math.floor(this._samples[i * 5 + IDX_R] * 255 / alphaSum),
                    Math.floor(this._samples[i * 5 + IDX_G] * 255 / alphaSum),
                    Math.floor(this._samples[i * 5 + IDX_B] * 255 / alphaSum)
                ) : 0;
        bitmapWriter.write(color, 1);
    }
};

/**
 * Gets the average color for the pixel at a specified index in the buffer.
 * @param {number} index  The index of the pixel whose average color will be calculated.
 * @returns {number} Average color.
 */
SuperSampleBuffer.prototype.getColorAt = function SuperSampleBuffer_getColorAt(index) {
    var sampleCount = this._samples[index * 5 + IDX_COUNT],
        alphaSum = this._samples[index * 5 + IDX_A];
    return sampleCount && alphaSum ? 
            colorUtils.from(
                Math.floor(alphaSum / sampleCount),
                Math.floor(this._samples[index * 5 + IDX_R] * 255 / alphaSum),
                Math.floor(this._samples[index * 5 + IDX_G] * 255 / alphaSum),
                Math.floor(this._samples[index * 5 + IDX_B] * 255 / alphaSum)
            ) : 0;
};

/**
 * Adds a color to the buffer up until the specified x index.
 * @param {number} color  Color to write.
 * @param {number} untilX  Samples of the color will be added the buffer until
 * the cursor reaches this coordinate.
 */
SuperSampleBuffer.prototype.add = function SuperSampleBuffer_add(color, untilX) {
    var samplesLeft = Math.floor(untilX * this._samplesPerPixel) - this._subPixelOffset - this._pixelOffset * this._samplesPerPixel;

    var a = colorUtils.alpha(color);
    var r = colorUtils.red(color);
    var g = colorUtils.green(color);
    var b = colorUtils.blue(color);
    
    // First partial pixel
    if (this._subPixelOffset > 0) {
        var samples = this._samplesPerPixel - this._subPixelOffset;
        if (samples > samplesLeft) {
            samples = samplesLeft;
        }
        samplesLeft -= samples;

        this._add(samples, a, r, g, b);

        this._subPixelOffset += samples;
        if (this._subPixelOffset == this._samplesPerPixel) {
            this._subPixelOffset = 0;
            this._pixelOffset++;
        }
    }

    // Full pixels
    var fullPixels = Math.floor(samplesLeft / this._samplesPerPixel);
    if (fullPixels > 0) {
        for (var i = 0; i < fullPixels; i++) {
            this._add(this._samplesPerPixel, a, r, g, b);
            this._pixelOffset++;
        }

        samplesLeft -= fullPixels * this._samplesPerPixel;
    }

    // Last partial pixel
    if (samplesLeft > 0) {
        this._add(samplesLeft, a, r, g, b);

        this._subPixelOffset += samplesLeft;

        if (this._subPixelOffset == this._samplesPerPixel) {
            this._subPixelOffset = 0;
            this._pixelOffset++;
        }
    }
};

module.exports = SuperSampleBuffer;
