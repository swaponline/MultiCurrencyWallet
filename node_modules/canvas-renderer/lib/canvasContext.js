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

const Edge = require("./rasterization/edge");
const colorUtils = require("./colorUtils");
const Matrix = require("./matrix");
const canvasState = require("./canvasState");

/**
 * Creates a new canvas with the specified dimensions given in pixels.
 */
function CanvasContext(canvas) {
    this.canvas = canvas;

    this._edges = canvas._edges;
    this.beginPath();
    
    this._savedStates = [];

    this.resetTransform();
}

/**
 * Specifies the fill color that is used when the fill method is called. Allowed values are:
 * - 32 bit integers on the format `0xRRGGBBAA`
 * - strings on the format `"#RGB"`
 * - strings on the format `"#RGBA"`
 * - strings on the format `"#RRGGBB"`
 * - strings on the format `"#RRGGBBAA"`
 * - strings on the format `"rgb(255, 255, 255)"`
 * - strings on the format `"rgb(255, 255, 255, 0.5)"`
 * - strings on the format `"rgb(255, 255, 255, 50%)"`
 * - strings on the format `"rgba(255, 255, 255, 0.5)"`
 * - strings on the format `"rgba(255, 255, 255, 50%)"`
 * - strings on the format `"hsl(134, 50%, 50%)"`
 * - strings on the format `"hsl(134, 50%, 50%, 0.5)"`
 * - strings on the format `"hsl(134, 50%, 50%, 50%)"`
 * - strings on the format `"hsla(134, 50%, 50%, 0.5)"`
 * - strings on the format `"hsla(134, 50%, 50%, 50%)"`
 * - strings on the format `"hwb(134, 50%, 50%)"`
 * - strings on the format `"hwb(134, 50%, 50%, 0.5)"`
 * - strings on the format `"hwb(134, 50%, 50%, 50%)"`
 * @type {string|number}
 */
CanvasContext.prototype.fillStyle = 0x000000ff;

/**
 * Saves the current drawing state to a stack. The state can later be restored by calling `CanvasContext.restore()`.
 * 
 * The following state is included when being saved to the stack:
 * - Current transformation matrix
 * - Current fill style
 */
CanvasContext.prototype.save = function CanvasContext_save() {
    this._savedStates.push(canvasState.capture(this));
};

/**
 * Restores the last drawing state that was saved with `CanvasContext.save()`, and then removes it from the state stack.
 */
CanvasContext.prototype.restore = function CanvasContext_restore() {
    if (this._savedStates.length) {
        canvasState.restore(this, this._savedStates.pop());
    }
};

/**
 * Restores the current transformation to the identity matrix.
 */
CanvasContext.prototype.resetTransform = function CanvasContext_resetTransform() {
    this._transform = new Matrix(1, 0, 0, 1, 0, 0);
};

/**
 * Multiplies the current transformation matrix with the specified values.
 */
CanvasContext.prototype.transform = function CanvasContext_transform(a, b, c, d, e, f) {
    if (!Number.isFinite(a) ||
        !Number.isFinite(b) ||
        !Number.isFinite(c) ||
        !Number.isFinite(d) ||
        !Number.isFinite(e) ||
        !Number.isFinite(f)) {
        return;
    }

    this._transform = this._transform.multiply(a, b, c, d, e, f);
};

/**
 * Sets the transformation matrix to the specified matrix.
 */
CanvasContext.prototype.setTransform = function CanvasContext_transform(a, b, c, d, e, f) {
    if (!Number.isFinite(a) ||
        !Number.isFinite(b) ||
        !Number.isFinite(c) ||
        !Number.isFinite(d) ||
        !Number.isFinite(e) ||
        !Number.isFinite(f)) {
        return;
    }

    this._transform = new Matrix(a, b, c, d, e, f);
};

/**
 * Applies a translation transformation on top of the current transform.
 * @param {number} x  Distance to move in the horizontal direction in pixels.
 * @param {number} y  Distance to move in the vertical direction in pixels.
 */
CanvasContext.prototype.translate = function CanvasContext_translate(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    this._transform = this._transform.translate(x, y);
};

/**
 * Applies a scale transformation on top of the current transform.
 * @param {number} x  Scale in the horizontal direction. `1` means no horizontal scaling.
 * @param {number} y  Scale in the vertical direction. `1` means no vertical scaling.
 */
CanvasContext.prototype.scale = function CanvasContext_scale(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    this._transform = this._transform.scale(x, y);
};

/**
 * Applies a rotation transformation on top of the current transform around the current canvas origo.
 * @param {number} angle  Angle in radians measured clockwise from the positive x axis.
 */
CanvasContext.prototype.rotate = function CanvasContext_rotate(angle) {
    if (!Number.isFinite(angle)) {
        return;
    }

    this._transform = this._transform.rotate(angle);
};

/**
 * Removes all existing subpaths and begins a new path.
 */
CanvasContext.prototype.beginPath = function CanvasContext_beginPath() {
    this._paths = [];
};

/**
 * Starts a new subpath that begins in the same point as the start and end point of the previous one.
 */
CanvasContext.prototype.closePath = function CanvasContext_closePath() {
    if (this._paths.length) {
        var path = this._paths[this._paths.length - 1];
        if (path.length > 2) {
            // Close path
            if (path[0] != path[path.length - 2] ||
                path[1] != path[path.length - 1]) {
                path.push(path[0]);
                path.push(path[1]);
            }

            // Begin a new path
            this._paths.push([path[0], path[1]]);
        }
    }
};

/**
 * Begins a new subpath by moving the cursor to the specified position.
 * @param {number} x  X coordinate.
 * @param {number} y  Y coordinate.
 */
CanvasContext.prototype.moveTo = function CanvasContext_moveTo(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    var p = this._transform.multiplyPoint(x, y);
    this._paths.push([p.x, p.y]);
};

/**
 * Inserts an edge between the last and specified position.
 * @param {number} x  Target X coordinate.
 * @param {number} y  Target Y coordinate.
 */
CanvasContext.prototype.lineTo = function CanvasContext_lineTo(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
    }

    if (!this._paths.length) {
        this._paths.push([]);
    }

    var p = this._transform.multiplyPoint(x, y);
    var path = this._paths[this._paths.length - 1];
    path.push(p.x);
    path.push(p.y);
};

/**
 * Adds an arc to the current path.
 * @param {number} x  X coordinate of the center of the arc.
 * @param {number} y  Y coordinate of the center of the arc.
 * @param {number} radius  Radius of the arc.
 * @param {number} startAngle  The angle in radians at which the arc starts, measured clockwise from the positive x axis.
 * @param {number} endAngle  The angle in radians at which the arc end, measured clockwise from the positive x axis.
 * @param {boolean} [anticlockwise]  Specifies whether the arc will be drawn counter clockwise. Default is clockwise.
 */
CanvasContext.prototype.arc = function CanvasContext_arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    if (!Number.isFinite(x) || !Number.isFinite(y) ||
        !Number.isFinite(radius) ||
        !Number.isFinite(startAngle) || !Number.isFinite(endAngle)) {
        return;
    }

    const TARGET_CHORD_LENGTH_PIXELS = 3;
    
    var sectors = Math.floor((Math.PI * radius * 2) / TARGET_CHORD_LENGTH_PIXELS);
    if (sectors < 9) {
        sectors = 9;
    }
    
    var sectorAngle = Math.PI * 2 / sectors;

    if (startAngle === endAngle) {
        return;
    }

    if (anticlockwise) {
        sectorAngle = -sectorAngle;

        if (startAngle - endAngle >= Math.PI * 2) {
            endAngle = startAngle - Math.PI * 2;
        }
        else {
            // Normalize end angle so that the sweep angle is in the range (0, -2PI]
            endAngle += Math.PI * 2 * Math.ceil((startAngle - endAngle) / (Math.PI * 2) - 1);
        }
    }
    else {
        if (endAngle - startAngle >= Math.PI * 2) {
            endAngle = startAngle + Math.PI * 2;
        }
        else {
            // Normalize end angle so that the sweep angle is in the range (0, 2PI]
            endAngle -= Math.PI * 2 * Math.ceil((endAngle - startAngle) / (Math.PI * 2) - 1);
        }
    }
    
    var dx, dy;
    sectors = (endAngle - startAngle) / sectorAngle;

    var angle = startAngle;
    
    for (var i = 0; i < sectors; i++) {
        dx = Math.cos(angle) * radius;
        dy = Math.sin(angle) * radius;
        this.lineTo(x + dx, y + dy);
        angle += sectorAngle;
    }

    dx = Math.cos(endAngle) * radius;
    dy = Math.sin(endAngle) * radius;
    this.lineTo(x + dx, y + dy);
};

/**
 * Fills a specified rectangle with fully transparent black without blending with the background or affecting the current paths.
 * @param {number} x  X coordinate of the left side of the rectangle.
 * @param {number} y  Y coordinate of the top of the rectangle.
 * @param {number} width  Width of the rectangle.
 * @param {number} height  Height of the rectangle.
 */
CanvasContext.prototype.clearRect = function CanvasContext_clearRect(x, y, width, height) {
    var fullCanvas = false;

    if (!this._transform.hasSkewing()) {
        // Check if the whole canvas is cleared
        var topLeft = this._transform.multiplyPoint(x, y);
        if (topLeft.x <= 0 && topLeft.y <= 0) {
            var bottomRight = this._transform.multiplyPoint(x + width, y + height);
            if (bottomRight.x >= this.canvas.width &&
                bottomRight.y >= this.canvas.height
            ) {
                fullCanvas = true;
            }
        }
    }

    if (fullCanvas) {
        this._edges.clear();
    }
    else {
        this._fillRect(colorUtils.FORCE_TRANSPARENT, x, y, width, height);
    }
};

/**
 * Fills a specified rectangle without affecting the current paths.
 * @param {number} x  X coordinate of the left side of the rectangle.
 * @param {number} y  Y coordinate of the top of the rectangle.
 * @param {number} width  Width of the rectangle.
 * @param {number} height  Height of the rectangle.
 */
CanvasContext.prototype.fillRect = function CanvasContext_fillRect(x, y, width, height) {
    var fillColor = colorUtils.parse(this.fillStyle);
    this._fillRect(fillColor, x, y, width, height);
};

CanvasContext.prototype._fillRect = function CanvasContext__fillRect(fillColor, x, y, width, height) {
    if (!Number.isFinite(x) || !Number.isFinite(y) ||
        !Number.isFinite(width) || !Number.isFinite(height) ||
        !width || !height) {
        return;
    }

    var id = this._edges.nextId++;
    
    var points = [
        this._transform.multiplyPoint(x, y),
        this._transform.multiplyPoint(x + width, y),
        this._transform.multiplyPoint(x + width, y + width),
        this._transform.multiplyPoint(x, y + width),
        this._transform.multiplyPoint(x, y)
    ];

    for (var i = 1; i < points.length; i++) {
        this._edges.add(new Edge(
            id,
            points[i - 1].x,
            points[i - 1].y,
            points[i].x,
            points[i].y,
            fillColor));
    }
};

/**
 * Fills the defined paths.
 * @param {string} [windingRule]  The winding rule to be used for determining
 *     which areas are covered by the current path. Valid values are "evenodd" and
 *     "nonzero". Default is `"nonzero"`.
 */
CanvasContext.prototype.fill = function CanvasContext_fill(windingRule) {
    var id = this._edges.nextId++;
    var fillColor = colorUtils.parse(this.fillStyle);
    
    for (var p = 0; p < this._paths.length; p++) {
        var points = this._paths[p];

        if (points.length <= 2) {
            // Nothing to fill
            continue;
        }

        for (var i = 2; i < points.length; i += 2) {
            this._edges.add(new Edge(
                id,
                points[i - 2],
                points[i - 1],
                points[i],
                points[i + 1],
                fillColor,
                windingRule));
        }
        
        // Close path
        if (points[0] != points[points.length - 2] ||
            points[1] != points[points.length - 1]) {
            this._edges.add(new Edge(
                id,
                points[points.length - 2],
                points[points.length - 1],
                points[0],
                points[1],
                fillColor,
                windingRule));
        }
    }
};

module.exports = CanvasContext;
