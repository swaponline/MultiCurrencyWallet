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

var CRC_TABLE = makeCrcTable();

/**
 * Creates a new running CRC32 calculator.
 */
function Crc32() { }

/**
 * The current CRC32 value.
 */
Crc32.prototype.value = 0;

/**
 * Adds more data to the CRC32 sum.
 * @param {Buffer} buffer  Data is read from this buffer.
 * @param {number} bufferStart  Index of first byte to read.
 * @param {number} bufferEnd  Index of exclusive last byte to read.
 */
Crc32.prototype.update = function Crc32_update(buffer, bufferStart, bufferEnd) {
    var crc = this.value ^ 0xffffffff;

    if (typeof bufferStart !== "number") {
        bufferStart = 0;
    }

    if (typeof bufferEnd !== "number") {
        bufferEnd = buffer.length;
    }
    
    for (var i = bufferStart; i < bufferEnd; i++) {
        crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
    }

    this.value = crc ^ 0xffffffff;
};


module.exports = Crc32;


function makeCrcTable() {
    var crcTable = [];

    for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
            if ((c & 1) == 1)
                c = 0xedb88320 ^ (c >>> 1);
            else
                c = c >>> 1;
        }
        crcTable[n] = c;
    }

    return crcTable;
}
