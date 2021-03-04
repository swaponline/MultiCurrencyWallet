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

/**
 * Keeps a list of edges per scanline.
 * @param {number} width  Clipping width.
 * @param {number} height  Clipping height.
 */
function EdgeTable(width, height) {
    this.width = width;
    this.height = height;
    this.clear();
}

/**
 * Sorts the edges of each scanline in ascending x coordinates.
 */
EdgeTable.prototype.clear = function EdgeTable_clear() {
    this.scanlines = [];
    this.scanlines.length = this.height;
    this.nextId = 1;
};

/**
 * Adds an edge to the table.
 * @param {Edge} edge
 */
EdgeTable.prototype.add = function EdgeTable_add(edge) {
    var minY, maxY;

    if (edge.y0 == edge.y1) {
        // Skip horizontal lines
        return;
    }
    else if (edge.y0 < edge.y1) {
        minY = Math.floor(edge.y0);
        maxY = Math.floor(edge.y1 + 0.996 /* 1/255 */);
    }
    else {
        minY = Math.floor(edge.y1);
        maxY = Math.floor(edge.y0 + 0.996 /* 1/255 */);
    }

    if (maxY < 0 || minY >= this.scanlines.length) {
        return;
    }

    if (minY < 0) {
        minY = 0;
    }
    if (maxY > this.scanlines.length) {
        maxY = this.scanlines.length;
    }

    if (minY < maxY) {
        var y = minY;
        var x1 = edge.intersection(y);

        while (y < maxY) {
            var x2 = edge.intersection(y + 1);

            var fromX, width;
            if (x1 < x2) {
                fromX = Math.floor(x1);
                width = Math.floor(x2 + 0.9999) - fromX;
            }
            else {
                fromX = Math.floor(x2);
                width = Math.floor(x1 + 0.9999) - fromX;
            }

            if (fromX < 0) {
                width += fromX;
                fromX = 0;

                if (width < 0) {
                    width = 0;
                }
            }

            if (fromX < this.width) {
                var scanline = this.scanlines[y];
                if (scanline == null) {
                    this.scanlines[y] = scanline = [];
                }
                scanline.push({
                    fromX: fromX,
                    width: width,
                    edge: edge
                });
            }

            x1 = x2;
            y++;
        }
    }
};

/**
 * Sorts the edges of each scanline in ascending x coordinates.
 */
EdgeTable.prototype.sort = function EdgeTable_sort() {
    for (var i = 0; i < this.scanlines.length; i++) {
        var arr = this.scanlines[i];
        if (arr) {
            arr.sort(function (x, y) {
                if (x.fromX < y.fromX) {
                    return -1;
                }
                if (x.fromX > y.fromX) {
                    return 1;
                }
                return 0;
            });
        }
    }
};

module.exports = EdgeTable;
