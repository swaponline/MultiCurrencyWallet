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
 * Keeps track of the z-order of the currently rendered polygons,
 * and computes the final color from the stack of layers.
 */
function LayerManager() {
    this._layers = [];
}

/**
 * The current visible color.
 */
LayerManager.prototype.color = colorUtils.TRANSPARENT;

/**
 * Clears the stack of layers.
 */
LayerManager.prototype.clear = function LayerManager_clear() {
    this._layers = [];
    this.color = colorUtils.TRANSPARENT;
};

/**
 * Copies all layers in this LayerManager to another LayerManager.
 * @param {LayerManager} other
 */
LayerManager.prototype.copyTo = function LayerManager_copyTo(other) {
    other.color = this.color;
    other._layers = [];
    
    for (var i = 0; i < this._layers.length; i++) {
        var layer = this._layers[i];
        other._layers[i] = {
            color: layer.color,
            inPath: layer.inPath,
            polygonId: layer.polygonId,
            winding: layer.winding
        };
    }
};

/**
 * Adds a layer for the specified edge. The z-order is defined by its id.
 * @param {Edge} edge
 */
LayerManager.prototype.add = function LayerManager_add(edge) {
    var dwinding = edge.y0 < edge.y1 ? 1 : -1;

    var inserted = false;
    for (var i = this._layers.length - 1; i >= 0; i--) {
        if (this._layers[i].polygonId == edge.polygonId) {
            this._layers[i].winding += dwinding;

            if (!this._layers[i].inPath()) {
                this._layers.splice(i, 1);
            }

            inserted = true;
            break;
        }
        else if (this._layers[i].polygonId < edge.polygonId) {
            // Insert here
            this._layers.splice(i + 1, 0, {
                polygonId: edge.polygonId,
                color: edge.color,
                winding: dwinding,
                inPath: edge.windingRule == "evenodd" ? inPath_evenOdd : inPath_nonZero
            });

            inserted = true;
            break;
        }
    }

    if (!inserted) {
        this._layers.splice(0, 0, {
            polygonId: edge.polygonId,
            color: edge.color,
            winding: dwinding,
            inPath: edge.windingRule == "evenodd" ? inPath_evenOdd : inPath_nonZero
        });
    }

    // Update current color
    var color = colorUtils.TRANSPARENT;
    for (var i = this._layers.length - 1; i >= 0 && colorUtils.alpha(color) < 255; i--) {
        var layerColor = this._layers[i].color;
        if (layerColor === colorUtils.FORCE_TRANSPARENT) {
            break;
        }

        color = colorUtils.over(color, layerColor);
    }
    this.color = color;
};

module.exports = LayerManager;


// Defines the winding rules

function inPath_evenOdd() {
    return this.winding % 2 == 1;
}
function inPath_nonZero() {
    return this.winding != 0;
}

