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

const Crc32 = require("./crc32");

function PngBuffer() {
    this._buffer = Buffer.alloc(1024);
}

PngBuffer.prototype = {
    /**
     * The internal Buffer.
     * @private
     */
    _buffer: null,

    /**
     * The position of the next byte in _buffer.
     * @private
     */
    _position: 0,

    /**
     * Ensures there are enough free capacity in the buffer.
     * @param {number} bytesNeeded  The minimum free space in the buffer.
     * @private
     */
    _ensureCapacity: function _ensureCapacity(bytesNeeded) {
        var targetLength = this._position + bytesNeeded;

        if (this._buffer.length < targetLength) {
            // This approximately doubles the buffer, while ensuring that 
            // it will always be large enough for the requested length.
            var newCapacity = this._buffer.length + targetLength;

            var oldBuffer = this._buffer;
            this._buffer = Buffer.alloc(newCapacity);
            
            oldBuffer.copy(this._buffer);
        }
    },

    /**
     * Writes the content of a Buffer to the PngBuffer.
     * @param {Buffer} buffer  Data to write.
     * @param {number} [bufferStart]  Index of first byte to write. Defaults to 0.
     * @param {number} [bufferEnd]  Index of first byte that will not be written. Defaults to end of buffer.
     */
    writeBuffer: function writeBuffer(buffer, bufferStart, bufferEnd) {
        if (typeof bufferStart == "undefined") {
            bufferStart = 0;
        }
        if (typeof bufferEnd == "undefined") {
            bufferEnd = buffer.length;
        }

        this._ensureCapacity(bufferEnd - bufferStart);
        buffer.copy(this._buffer, this._position, bufferStart, bufferEnd);
        this._position += bufferEnd - bufferStart;
    },

    /**
     * Writes a string to the buffer.
     * @param {string} str  String to write.
     */
    writeString: function writeString(str) {
        const encodedStr = Buffer.from(str, "latin1");
        this.writeBuffer(encodedStr);
    },

    /**
     * Writes a 32 bit signed int to the buffer in Big Endian format.
     * @param {number} value  Value to write.
     */
    writeInt32BE: function writeInt32BE(value) {
        this._ensureCapacity(4);
        this._buffer.writeInt32BE(value, this._position);
        this._position += 4;
    },

    /**
     * Writes a 32 bit unsigned int to the buffer in Big Endian format.
     * @param {number} value  Value to write.
     */
    writeUInt32BE: function writeUInt32BE(value) {
        this._ensureCapacity(4);
        this._buffer.writeUInt32BE(value, this._position, true);
        this._position += 4;
    },

    /**
     * Writes an 8 bit signed int to the buffer.
     * @param {number} value  Value to write.
     */
    writeInt8: function writeInt8(value) {
        this._ensureCapacity(1);
        this._buffer.writeInt8(value, this._position++);
    },

    /**
     * Writes an 8 bit unsigned int to the buffer.
     * @param {number} value  Value to write.
     */
    writeUInt8: function writeUInt8(value) {
        this._ensureCapacity(1);
        this._buffer.writeUInt8(value, this._position++);
    },

    /**
     * Starts a new PNG chunk.
     * @param {string} type  Name of the chunk. Must contain exactly 4 ASCII characters.
     */
    startChunk: function startChunk(type) {
        // Save the start index of the chunk since we need it to
        // calculate the crc32 and to update the data length.
        this._chunkStart = this._position;

        // Ensure capacity for length, name and crc32.
        this._ensureCapacity(12); 

        // Length, reserve space
        this._position += 4;
        
        // Name
        this._buffer.write(type, this._position, 4, "ascii");
        this._position += 4;
    },

    /**
     * Closes the current PNG chunk.
     */
    endChunk: function endChunk() {
        // Compute Crc32 for type + data
        var crc = new Crc32();
        crc.update(this._buffer, this._chunkStart + 4, this._position);

        // Length
        var dataLength = this._position - (this._chunkStart + 8);
        this._buffer.writeInt32BE(dataLength, this._chunkStart);

        // Crc32
        this.writeInt32BE(crc.value);
    },

    /**
     * Gets a Buffer with the PNG encoded data.
     * @returns {Buffer}
     */
    getBuffer: function getBuffer() {
        return this._buffer.slice(0, this._position);
    }
};

module.exports = PngBuffer;
