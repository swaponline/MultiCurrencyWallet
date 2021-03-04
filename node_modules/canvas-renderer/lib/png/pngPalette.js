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

/**
 * Creates a PNG color palette for the specified bitmap data.
 * @param {Array} colorRanges
 */
function PngPalette(colorRanges) {
    var lookup = {};
    var colors = [];
    var hasAlphaChannel = false;

    for (var i = 0; i + 1 < colorRanges.length && colors.length <= 256; i += 2) {
        var count = colorRanges[i + 0];
        var color = colorRanges[i + 1];

        if (!count) {
            // Empty range
            continue;
        }

        if (color in lookup) {
            // Color already processed
            continue;
        }

        if (!hasAlphaChannel && colorUtils.alpha(color) < 255) {
            hasAlphaChannel = true;
        }

        lookup[color] = colors.length;
        colors.push(color);
    }

    this.hasAlphaChannel = hasAlphaChannel;
    this.colors = colors;
    this.lookup = lookup;
    this.isValid = colors.length <= 256;
}

/**
 * Specifies if the palette is valid to be used for encoding a PNG image.
 */
PngPalette.prototype.isValid = false;

/**
 * Specifies if the palette has any partial or fully transparent
 * colors.
 */
PngPalette.prototype.hasAlphaChannel = false;

/**
 * Array of colors in the palette.
 */
PngPalette.prototype.colors = [];

/**
 * Lookup table from 32-bit color value to color index.
 */
PngPalette.prototype.lookup = {};

module.exports = PngPalette;
