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

function BitmapWriter(backColor, width, height) {
    this.backColor = backColor;
    this.canvas = [];
}

BitmapWriter.prototype.write = function write(color, count) {
    if (count > 0) {
        this.canvas.push(count);
        this.canvas.push(colorUtils.over(color, this.backColor));
    }
};

BitmapWriter.prototype.skip = function skip(count) {
    if (count > 0) {
        this.canvas.push(count);
        this.canvas.push(this.backColor);
    }
};

module.exports = BitmapWriter;
