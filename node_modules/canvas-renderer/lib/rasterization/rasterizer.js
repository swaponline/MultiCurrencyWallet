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

const BitmapWriter = require("./bitmapWriter");
const LayerManager = require("./layerManager");
const SuperSampleBuffer = require("./superSampleBuffer");
const colorUtils = require("../colorUtils");

/**
 * A higher number of samples per pixel horizontally does not affect the
 * performance in the same way as SAMPLES_PER_PIXEL_Y, since the rasterizer
 * does not scan every subpixel horizontally.
 */
const SAMPLES_PER_PIXEL_X = 10;

/**
 * A higher number of samples vertically means lower performance, since
 * the rasterizer does a scan for every subpixel vertically.
 */
const SAMPLES_PER_PIXEL_Y = 4;

const SAMPLE_HEIGHT = 1 / SAMPLES_PER_PIXEL_Y;


module.exports = rasterize;


/**
 * Rasterizes the edges in the edge table to a list of color ranges. No range will span
 * multiple scanlines.
 * @param {EdgeTable} edgeTable 
 * @param {number} backColor
 */
function rasterize(edgeTable, backColor) {
    edgeTable.sort();

    var writer = new BitmapWriter(backColor, edgeTable.width, edgeTable.height);
    
    // Allocate an extra slot in the super sample buffer to calculate the 
    // color that will be forwarded until the next supersample range.
    var superSampleBuffer = new SuperSampleBuffer(edgeTable.width + 1, SAMPLES_PER_PIXEL_X);

    var layers = [];
    var color = 0;
    
    // Keeps track of how many of the subpixellayers that are used for 
    // the currently rendered scanline. Until a range requiring supersampling
    // is encountered only a single layer is needed.
    var usedLayers = 0;

    // Create a layer manager for every subpixel scanline
    for (var i = 0; i < SAMPLES_PER_PIXEL_Y; i++) {
        layers[i] = new LayerManager();
    }

    for (var ey = 0; ey < edgeTable.height; ey++) {
        var scanline = edgeTable.scanlines[ey];
        if (!scanline || !scanline.length) {
            writer.skip(edgeTable.width);
            continue;
        }
        
        for (var i = 0; i < usedLayers; i++) {
            layers[i].clear();
        }
        usedLayers = 1;

        var superSampleRanges = getSuperSampleRanges(scanline, edgeTable.width);

        writer.skip(superSampleRanges[0].fromX);

        for (var rangeIndex = 0; rangeIndex < superSampleRanges.length; rangeIndex++) {
            var superSampleRange = superSampleRanges[rangeIndex];
            
            // If there is exactly one edge in the supersample range, and it is crossing
            // the entire scanline, we can perform the antialiasing by integrating the
            // edge function.
            if (superSampleRange.edges.length == 1 && (
                superSampleRange.edges[0].y0 <= ey && superSampleRange.edges[0].y1 >= ey + 1 ||
                superSampleRange.edges[0].y0 >= ey + 1 && superSampleRange.edges[0].y1 <= ey
                )) {
                var edge = superSampleRange.edges[0];

                // Determine the lower and upper x value where the edge 
                // intersects the scanline.
                var xey = edge.intersection(ey);
                var xey1 = edge.intersection(ey + 1);
                var x0 = Math.min(xey, xey1);
                var x1 = Math.max(xey, xey1);
                var width = x1 - x0;

                // Compute the average color of all subpixel layers before
                // and after the edge intersection.
                for (var sy = 0; sy < usedLayers; sy++) {
                    var subScanlineLayers = layers[sy];
                    superSampleBuffer.add(subScanlineLayers.color, 1);
                    subScanlineLayers.add(edge);
                    superSampleBuffer.add(subScanlineLayers.color, 2);
                    superSampleBuffer.rewind();
                }

                var fromColor = superSampleBuffer.getColorAt(0);
                color = superSampleBuffer.getColorAt(1);
                
                superSampleBuffer.clear();

                // Render pixels
                for (var x = superSampleRange.fromX; x < superSampleRange.toXExcl; x++) {
                    if (x0 >= x + 1) {
                        // Pixel not covered
                        writer.write(fromColor, 1);
                        continue;
                    }

                    if (x1 <= x) {
                        // Pixel fully covered
                        writer.write(color, 1);
                        continue;
                    }
                    
                    // toColor coverage in the range [0.0, 1.0]
                    // Initialize to the fully covered range of the pixel.
                    var coverage = x1 < x + 1 ? x + 1 - x1 : 0;

                    // Compute integral for non-vertical edges
                    if (width > 0.001) {
                        // Range to integrate
                        var integralFrom = Math.max(x0, x);
                        var integralTo = Math.min(x1, x + 1);

                        coverage += 
                            (
                                (integralTo * integralTo - integralFrom * integralFrom) / 2 +
                                x0 * (integralFrom - integralTo)
                            ) / width;
                    }

                    writer.write(colorUtils.mix(fromColor, color, coverage), 1);
                }

            } // /simplified antialiasing
            else {
                // There are more than a single intersecting edge in this range.
                // Use super sampling to render the pixels.
                var y = ey + SAMPLE_HEIGHT / 2;
                
                // Ensure all subpixel layers are initialized
                while (usedLayers < SAMPLES_PER_PIXEL_Y) {
                    layers[0].copyTo(layers[usedLayers]);
                    usedLayers++;
                }

                // Average color of the pixels following the current supersample range.
                for (var sy = 0; sy < SAMPLES_PER_PIXEL_Y; sy++ , y += SAMPLE_HEIGHT) {
                    var subScanlineLayers = layers[sy];
                    color = subScanlineLayers.color;

                    var intersections = getIntersections(superSampleRange.edges, y);

                    for (var i = 0; i < intersections.length; i++) {
                        var intersection = intersections[i];
                        superSampleBuffer.add(color, intersection.x - superSampleRange.fromX);
                        subScanlineLayers.add(intersection.edge);
                        color = subScanlineLayers.color;
                    }

                    // Write an extra pixel that will contain the color that
                    // will be forwarded until the next supersample range.
                    superSampleBuffer.add(color, superSampleRange.width + 1);
                    superSampleBuffer.rewind();
                } // /subpixel
                
                // Get color to be forwarded
                color = superSampleBuffer.getColorAt(superSampleRange.width);

                // Blend subpixels
                superSampleBuffer.writeTo(writer, superSampleRange.width);
                superSampleBuffer.clear();
            }
            
            // Forward last color
            if (rangeIndex + 1 < superSampleRanges.length) {
                var nextRangeX = superSampleRanges[rangeIndex + 1].fromX;
                writer.write(color, nextRangeX - superSampleRange.toXExcl);
            }
            else {
                writer.write(color, edgeTable.width - superSampleRange.toXExcl);
            }
        } // /range
    }

    return writer.canvas;
}

/**
 * Determines what edges that intersect a horizontal line with the specified y coordinate.
 * For each intersecting edge the intersecting x coordinate is returned.
 * @param {Array} scanline  Array of edges in the current scanline.
 * @returns {Array} Array with objects like { x: number, edge: Edge }. Objects
 * are sorted ascending by x coordinate.
 */
function getIntersections(edges, y) {
    var intersections = [];

    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];

        if (edge.y0 < y && edge.y1 >= y ||
            edge.y0 >= y && edge.y1 < y) {
            var x = edge.x0 +
                (edge.x1 - edge.x0) * (y - edge.y0) /
                (edge.y1 - edge.y0);

            intersections.push({
                edge: edge,
                x: x
            });
        }
    }

    intersections.sort(function (a, b) {
        return a.x - b.x;
    });

    return intersections;
}

/**
 * Determines what ranges of a scanline that needs to be supersampled.
 * @param {Array} scanline  Array of edges in the current scanline.
 * @returns {Array}  Array of ranges like { fromX: number, toXExcl: number, edges: Edge[] }
 */
function getSuperSampleRanges(scanline, width) {
    var superSampleRanges = [];

    var rangeIndex = 0;
    var superSampleRangeIndex = 0;

    while (rangeIndex < scanline.length) {
        var superSampleRange = {
            fromX: scanline[rangeIndex].fromX,
            toXExcl: scanline[rangeIndex].fromX + scanline[rangeIndex].width,
            edges: [scanline[rangeIndex].edge]
        };

        if (superSampleRange.fromX >= width) {
            break;
        }

        superSampleRanges.push(superSampleRange);

        rangeIndex++;

        for (var i = rangeIndex; i < scanline.length; i++) {
            if (scanline[i].fromX < superSampleRange.toXExcl) {
                superSampleRange.toXExcl = Math.max(superSampleRange.toXExcl, scanline[i].fromX + scanline[i].width);
                superSampleRange.edges.push(scanline[i].edge);
                rangeIndex++;
            }
            else {
                break;
            }
        }

        superSampleRange.toXExcl = Math.min(superSampleRange.toXExcl, width);
        superSampleRange.width = superSampleRange.toXExcl - superSampleRange.fromX;
    }

    return superSampleRanges;
}


