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

module.exports = {
    /**
     * Transparent color.
     * @type {number}
     * @constant
     */
    TRANSPARENT: 0,

    /**
     * Specifies a transparent color that will not blend with layers below the current layer.
     * @type {number}
     * @constant
     */
    FORCE_TRANSPARENT: Infinity,

    /**
     * Creates a signed 32-bit RGBA color value from the specified color components.
     * @returns {number}
     */
    from: colorUtils_from,

    /**
     * Gets the alpha component of a color.
     * @param {number} color  32-bit color value on the format 0xRRGGBBAA.
     * @returns {number}
     */
    alpha: colorUtils_alpha,

    /**
     * Gets the red component of a color.
     * @param {number} color  32-bit color value on the format 0xRRGGBBAA.
     * @returns {number}
     */
    red: colorUtils_red,

    /**
     * Gets the green component of a color.
     * @param {number} color  32-bit color value on the format 0xRRGGBBAA.
     * @returns {number}
     */
    green: colorUtils_green,

    /**
     * Gets the blue component of a color.
     * @param {number} color  32-bit color value on the format 0xRRGGBBAA.
     * @returns {number}
     */
    blue: colorUtils_blue,

    /**
     * Parses a value to a 32-bit color on the format 0xRRGGBBAA. The following formats are supported:
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
     *
     * @param {number|string} color  The value to parse.
     * @returns {number}
     */
    parse: colorUtils_parse,
    
    /**
     * Computes a mix of the two specified colors, with the proportion given by the specified weight.
     * @param {number} color1  First color to mix.
     * @param {number} color2  Second color to mix.
     * @param {number} weight  Weight in the range [0,1]. 0 gives color1, 1 gives color2.
     * @returns {number} Mixed color.
     */
    mix: colorUtils_mix,
    
    /**
     * Formats the specified color as a hex string #RRGGBBAA.
     * @param {number|string} color  The color to format. Can be a numeric color on the format 0xRRGGBBAA or a string parsable by colorUtils.parse.
     * @returns {string}
     */
    format: function colorUtils_format(color) {
        color = colorUtils_parse(color);
        if (isFinite(color)) {
            return "#" + 
                ("000000" + (color >>> 8).toString(16)).slice(-6) + 
                ("00" + (color & 0xff).toString(16)).slice(-2);
        }
    },

    /**
     * Blends this color with another color using the over blending operation.
     * @param {number} fore  The foreground color.
     * @param {number} back  The background color.
     */
    over: function colorUtils_over(fore, back) {
        var foreA = colorUtils_alpha(fore);

        if (foreA < 1) {
            return back;
        }
        else if (foreA > 254 || colorUtils_alpha(back) < 1) {
            return fore;
        }

        // Source: https://en.wikipedia.org/wiki/Alpha_compositing#Description
        var forePA = foreA * 255;
        var backPA = colorUtils_alpha(back) * (255 - foreA);
        var pa = (forePA + backPA);

        var b = Math.floor(
            (forePA * colorUtils_blue(fore) + backPA * colorUtils_blue(back)) /
            pa);

        var g = Math.floor(
            (forePA * colorUtils_green(fore) + backPA * colorUtils_green(back)) /
            pa);

        var r = Math.floor(
            (forePA * colorUtils_red(fore) + backPA * colorUtils_red(back)) /
            pa);

        var a = Math.floor(pa / 255);

        return (r << 24) | (g << 16) | (b << 8) | a;
    }
};

function colorUtils_mix(color1, color2, weight) {
    if (weight < 0) {
        weight = 0;
    }
    else if (weight > 1) {
        weight = 1;
    }
    
    var a = (color1 & 0xff) * (1 - weight) + (color2 & 0xff) * weight;
    if (a <= 0.1) {
        return 0;
    }
    
    var r = (
        (color1 >>> 24) * (color1 & 0xff) * (1 - weight) +
        (color2 >>> 24) * (color2 & 0xff) * weight
        ) / a;
        
    var g = (
        ((color1 >>> 16) & 0xff) * (color1 & 0xff) * (1 - weight) +
        ((color2 >>> 16) & 0xff) * (color2 & 0xff) * weight
        ) / a;
        
    var b = (
        ((color1 >>> 8) & 0xff) * (color1 & 0xff) * (1 - weight) +
        ((color2 >>> 8) & 0xff) * (color2 & 0xff) * weight
        ) / a;
    
    if (a > 255) a = 255;    
    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;
    
    return (r << 24) | (g << 16) | (b << 8) | a;
}

function colorUtils_from(a, r, g, b) {
    return (r << 24) | (g << 16) | (b << 8) | a;
}

function colorUtils_alpha(color) {
    return color & 0xff;
}

function colorUtils_red(color) {
    return (color >>> 24);
}

function colorUtils_green(color) {
    return (color >>> 16) & 0xff;
}

function colorUtils_blue(color) {
    return (color >>> 8) & 0xff;
}

// Named colors as defined in CSS Color Module Level 4.
// https://www.w3.org/TR/css-color-4/#named-colors
var NAMED_COLORS = {
    "transparent": 0,
    "antiquewhite": 0xFAEBD7FF,
    "aqua": 0x00FFFFFF,
    "aquamarine": 0x7FFFD4FF,
    "azure": 0xF0FFFFFF,
    "beige": 0xF5F5DCFF,
    "bisque": 0xFFE4C4FF,
    "black": 0x000000FF,
    "blanchedalmond": 0xFFEBCDFF,
    "blue": 0x0000FFFF,
    "blueviolet": 0x8A2BE2FF,
    "brown": 0xA52A2AFF,
    "burlywood": 0xDEB887FF,
    "cadetblue": 0x5F9EA0FF,
    "chartreuse": 0x7FFF00FF,
    "chocolate": 0xD2691EFF,
    "coral": 0xFF7F50FF,
    "cornflowerblue": 0x6495EDFF,
    "cornsilk": 0xFFF8DCFF,
    "crimson": 0xDC143CFF,
    "cyan": 0x00FFFFFF,
    "darkblue": 0x00008BFF,
    "darkcyan": 0x008B8BFF,
    "darkgoldenrod": 0xB8860BFF,
    "darkgray": 0xA9A9A9FF,
    "darkgreen": 0x006400FF,
    "darkgrey": 0xA9A9A9FF,
    "darkkhaki": 0xBDB76BFF,
    "darkmagenta": 0x8B008BFF,
    "darkolivegreen": 0x556B2FFF,
    "darkorange": 0xFF8C00FF,
    "darkorchid": 0x9932CCFF,
    "darkred": 0x8B0000FF,
    "darksalmon": 0xE9967AFF,
    "darkseagreen": 0x8FBC8FFF,
    "darkslateblue": 0x483D8BFF,
    "darkslategray": 0x2F4F4FFF,
    "darkslategrey": 0x2F4F4FFF,
    "darkturquoise": 0x00CED1FF,
    "darkviolet": 0x9400D3FF,
    "deeppink": 0xFF1493FF,
    "deepskyblue": 0x00BFFFFF,
    "dimgray": 0x696969FF,
    "dimgrey": 0x696969FF,
    "dodgerblue": 0x1E90FFFF,
    "firebrick": 0xB22222FF,
    "floralwhite": 0xFFFAF0FF,
    "forestgreen": 0x228B22FF,
    "fuchsia": 0xFF00FFFF,
    "gainsboro": 0xDCDCDCFF,
    "ghostwhite": 0xF8F8FFFF,
    "gold": 0xFFD700FF,
    "goldenrod": 0xDAA520FF,
    "gray": 0x808080FF,
    "green": 0x008000FF,
    "greenyellow": 0xADFF2FFF,
    "grey": 0x808080FF,
    "honeydew": 0xF0FFF0FF,
    "hotpink": 0xFF69B4FF,
    "indianred": 0xCD5C5CFF,
    "indigo": 0x4B0082FF,
    "ivory": 0xFFFFF0FF,
    "khaki": 0xF0E68CFF,
    "lavender": 0xE6E6FAFF,
    "lavenderblush": 0xFFF0F5FF,
    "lawngreen": 0x7CFC00FF,
    "lemonchiffon": 0xFFFACDFF,
    "lightblue": 0xADD8E6FF,
    "lightcoral": 0xF08080FF,
    "lightcyan": 0xE0FFFFFF,
    "lightgoldenrodyellow": 0xFAFAD2FF,
    "lightgray": 0xD3D3D3FF,
    "lightgreen": 0x90EE90FF,
    "lightgrey": 0xD3D3D3FF,
    "lightpink": 0xFFB6C1FF,
    "lightsalmon": 0xFFA07AFF,
    "lightseagreen": 0x20B2AAFF,
    "lightskyblue": 0x87CEFAFF,
    "lightslategray": 0x778899FF,
    "lightslategrey": 0x778899FF,
    "lightsteelblue": 0xB0C4DEFF,
    "lightyellow": 0xFFFFE0FF,
    "lime": 0x00FF00FF,
    "limegreen": 0x32CD32FF,
    "linen": 0xFAF0E6FF,
    "magenta": 0xFF00FFFF,
    "maroon": 0x800000FF,
    "mediumaquamarine": 0x66CDAAFF,
    "mediumblue": 0x0000CDFF,
    "mediumorchid": 0xBA55D3FF,
    "mediumpurple": 0x9370DBFF,
    "mediumseagreen": 0x3CB371FF,
    "mediumslateblue": 0x7B68EEFF,
    "mediumspringgreen": 0x00FA9AFF,
    "mediumturquoise": 0x48D1CCFF,
    "mediumvioletred": 0xC71585FF,
    "midnightblue": 0x191970FF,
    "mintcream": 0xF5FFFAFF,
    "mistyrose": 0xFFE4E1FF,
    "moccasin": 0xFFE4B5FF,
    "navajowhite": 0xFFDEADFF,
    "navy": 0x000080FF,
    "oldlace": 0xFDF5E6FF,
    "olive": 0x808000FF,
    "olivedrab": 0x6B8E23FF,
    "orange": 0xFFA500FF,
    "orangered": 0xFF4500FF,
    "orchid": 0xDA70D6FF,
    "palegoldenrod": 0xEEE8AAFF,
    "palegreen": 0x98FB98FF,
    "paleturquoise": 0xAFEEEEFF,
    "palevioletred": 0xDB7093FF,
    "papayawhip": 0xFFEFD5FF,
    "peachpuff": 0xFFDAB9FF,
    "peru": 0xCD853FFF,
    "pink": 0xFFC0CBFF,
    "plum": 0xDDA0DDFF,
    "powderblue": 0xB0E0E6FF,
    "purple": 0x800080FF,
    "rebeccapurple": 0x663399FF,
    "red": 0xFF0000FF,
    "rosybrown": 0xBC8F8FFF,
    "royalblue": 0x4169E1FF,
    "saddlebrown": 0x8B4513FF,
    "salmon": 0xFA8072FF,
    "sandybrown": 0xF4A460FF,
    "seagreen": 0x2E8B57FF,
    "seashell": 0xFFF5EEFF,
    "sienna": 0xA0522DFF,
    "silver": 0xC0C0C0FF,
    "skyblue": 0x87CEEBFF,
    "slateblue": 0x6A5ACDFF,
    "slategray": 0x708090FF,
    "slategrey": 0x708090FF,
    "snow": 0xFFFAFAFF,
    "springgreen": 0x00FF7FFF,
    "steelblue": 0x4682B4FF,
    "tan": 0xD2B48CFF,
    "teal": 0x008080FF,
    "thistle": 0xD8BFD8FF,
    "tomato": 0xFF6347FF,
    "turquoise": 0x40E0D0FF,
    "violet": 0xEE82EEFF,
    "wheat": 0xF5DEB3FF,
    "white": 0xFFFFFFFF,
    "whitesmoke": 0xF5F5F5FF,
    "yellow": 0xFFFF00FF,
    "yellowgreen": 0x9ACD32FF
};

function parseRgbComponent(value) {
    var match = value.match(/^\s*(\d*(?:\.\d*)?)(%?)\s*$/);
    if (match) {
        var result = parseFloat(match[1]);
        if (isNaN(result)) {
            return NaN;
        }
        
        result = match[2] ?
        
            // Percentage
            255 * result / 100 :
            
            // Absolute number
            result;
        
        result = 0 | result;
        
        if (result < 0) {
            result = 0;
        }
        if (result > 255) {
            result = 255;
        }
        
        return result;
    }
    return NaN;
}

function parsePercent(value) {
    var match = value.match(/^\s*(\d*(?:\.\d*)?)%\s*$/);
    if (match) {
        var result = parseFloat(match[1]);
        if (isNaN(result)) {
            return NaN;
        }
        
        // Percentage
        result = result / 100;
        
        return (
            result < 0 ? 0 : 
            result > 1 ? 1 : 
            result
            );
    }
    return NaN;
}

function parseAlpha(value) {
    if (!value) {
        return 255;
    }
    
    var match = value.match(/^\s*(\d*(?:\.\d*)?)(%?)\s*$/);
    if (match) {
        var result = parseFloat(match[1]);
        if (isNaN(result)) {
            return NaN;
        }
        
        // Percentage
        if (match[2]) {
            result = result / 100;
        }
        
        result = 0 | (255 * result);
        
        return (
            result < 0 ? 0 : 
            result > 255 ? 255 : 
            result
            );
    }
    return NaN;
}

// HSL conversion from CSS Color Module Level 4
// Source: https://www.w3.org/TR/css-color-4/#hsl-to-rgb
function hslToRgb(hue, sat, light) {
    if (light <= .5) {
        var t2 = light * (sat + 1);
    } else {
        var t2 = light + sat - (light * sat);
    }
    var t1 = light * 2 - t2;
    var r = hueToRgb(t1, t2, hue + 2);
    var g = hueToRgb(t1, t2, hue);
    var b = hueToRgb(t1, t2, hue - 2);
    return [r, g, b];
}
function hueToRgb(t1, t2, hue) {
    if (hue < 0) hue += 6;
    if (hue >= 6) hue -= 6;

    if (hue < 1) return (t2 - t1) * hue + t1;
    else if (hue < 3) return t2;
    else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
    else return t1;
}

// https://www.w3.org/TR/css-color-4/#hwb-to-rgb
function hwbToRgb(hue, white, black) {
    var rgb = hslToRgb(hue, 1, .5);
    for (var i = 0; i < 3; i++) {
        rgb[i] *= (1 - white - black);
        rgb[i] += white;
    }
    return rgb;
}

function parseHsla(h, s, l, a) {
    if (isFinite(h = parseHue(h)) && 
        isFinite(s = parsePercent(s)) && 
        isFinite(l = parsePercent(l)) && 
        isFinite(a = parseAlpha(a))) {
        var rgb = hslToRgb(h, s, l);
        return colorUtils_from(a, 
            (rgb[0] * 255) & 0xff, 
            (rgb[1] * 255) & 0xff, 
            (rgb[2] * 255) & 0xff);
    }
}


function parseRgba(r, g, b, a) {
    if (isFinite(r = parseRgbComponent(r)) && 
        isFinite(g = parseRgbComponent(g)) && 
        isFinite(b = parseRgbComponent(b)) && 
        isFinite(a = parseAlpha(a))) {
        return colorUtils_from(a, r, g, b);
    }
}

// Outputs a value [0, 6)
function parseHue(value) {
    var match = value.match(/^\s*(\d*(?:\.\d*)?)(deg|grad|rad|turn|)\s*$/);
    if (match) {
        var result = parseFloat(match[1]);
        if (isNaN(result)) {
            return NaN;
        }
        
        // Percentage
        switch (match[2]) {
            case "grad":
                // Gradians: range 0 - 400
                result = 6 * result / 400;
                break;
            case "rad":
                // Radians: range 0 - 2π
                result = 3 * result / Math.PI;
                break;
            case "turn":
                // Turns: range 0 - 1
                result = result * 6;
                break;
            default:
                // Degree: range 0 - 360
                result = result / 60;
                break;
        }
        
        result = (result % 6);
        
        if (result < 0) {
            result += 6;
        }
        
        return result;
    }
    return NaN;
}

function parseHexColor(color) {
    var hexColor = color; 
    if (hexColor.charAt(0) == "#") {
        hexColor = hexColor.substr(1);
    }

    var numeric = parseInt(hexColor, 16);
    
    // numeric is now parsed as a 32-bit unsigned integer.
    // All return paths below must perform a bitwise operator
    // on numeric before returning it to ensure it is converted to a 
    // 32-bit signed integer.

    switch (hexColor.length) {
        case 3:
            return (
                ((numeric & 0xf00) << 20) |
                ((numeric & 0xf00) << 16) |
                ((numeric & 0x0f0) << 16) |
                ((numeric & 0x0f0) << 12) |
                ((numeric & 0x00f) << 12) |
                ((numeric & 0x00f) << 8) | 
                0xff);
        case 4:
            return (
                ((numeric & 0xf000) << 16) |
                ((numeric & 0xf000) << 12) |
                ((numeric & 0x0f00) << 12) |
                ((numeric & 0x0f00) << 8) |
                ((numeric & 0x00f0) << 8) |
                ((numeric & 0x00f0) << 4) | 
                ((numeric & 0x000f) << 4) |
                ((numeric & 0x000f))
                );
        case 6:
            return numeric << 8 | 0xff;
        case 8:
            // The bitwise operation enforces the value to a 32-bit signed integer
            return numeric & 0xffffffff;
    }
}

function parseHwb(h, w, b, a) {
    if (isFinite(h = parseHue(h)) && 
        isFinite(w = parsePercent(w)) && 
        isFinite(b = parsePercent(b)) && 
        isFinite(a = parseAlpha(a))) {
        if (w + b > 1) {
            w = w / (w + b);
            b = 1 - w;
        }
        var rgb = hwbToRgb(h, w, b);
        return colorUtils_from(a, 
            (rgb[0] * 255) & 0xff, 
            (rgb[1] * 255) & 0xff, 
            (rgb[2] * 255) & 0xff);
    }
}

function colorUtils_parse(color) {
    if (typeof color == "number") {
        return color & 0xffffffff;
    }

    color = "" + color;
    
    // Hex colors
    if (/^#?[0-9a-f]{3,8}$/i.test(color)) {
        return parseHexColor(color);
    }
    
    color = color.toLowerCase();
    
    // Named colors
    if (color in NAMED_COLORS) {
        // bitwise operator is used to enforce a signed integer
        return NAMED_COLORS[color] & 0xffffffff;
    }
    
    // rgb[a](red, green, blue[, alpha])
    var rgba = color.match(/^rgba?\(([^,]+),([^,]+),([^,]+)(?:,([^,]+))?\)$/);
    if (rgba) {
        return parseRgba(rgba[1], rgba[2], rgba[3], rgba[4]);
    }
    
    // hsl[a](hue, saturation, lightness[, alpha])
    var hsla = color.match(/^hsla?\(([^,]+),([^,]+),([^,]+)(?:,([^,]+))?\)$/);
    if (hsla) {
        return parseHsla(hsla[1], hsla[2], hsla[3], hsla[4]);
    }
    
    // hwb(hue, whiteness, blackness[, alpha]?)
    var hwb = color.match(/^hwb\(([^,]+),([^,]+),([^,]+)(?:,([^,]+))?\)$/);
    if (hwb) {
        return parseHwb(hwb[1], hwb[2], hwb[3], hwb[4]);
    }

    throw new Error("Invalid color " + color);
}

