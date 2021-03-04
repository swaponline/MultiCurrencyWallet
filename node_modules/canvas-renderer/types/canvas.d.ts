import { CanvasContext } from "./canvasContext";

/**
 * Represents a canvas partly compatible with the official `HTMLCanvasElement`.
 */
export interface Canvas {
    /**
     * The width of the canvas in pixels.
     */
    width: number;
    /**
     * The height of the canvas in pixels.
     */
    height: number;
    /**
     * Specifies the background color. Default is fully transparent. Allowed values are:
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
     */
    backColor: number | string;
    /**
     * Gets a context used to draw polygons on this canvas.
     * @param contextId Type of context. Only `"2d"` is supported, and also the default value.
     * @param contextAttributes Options passed to the context. Currently no options are supported. Provided for compatibility with `HTMLCanvasElement`.
     */
    getContext(contextId?: string, contextAttributes?: {}): CanvasContext;
    /**
     * Renders the canvas as a PNG data stream.
     * @param keywords Keywords to be written to the PNG stream. See https://www.w3.org/TR/PNG/#11keywords.
     */
    toPng(keywords?: { [key: string]: string }): Buffer;
    /**
     * Renders the canvas as a data URI.
     * @param type Content type of returned image. Only `"image/png"` is supported, and also the default value.
     * @param encoderOptions Options passed to the image encoder. Currently no options are recognized. Provided for compatibility with `HTMLCanvasElement`.
     */
    toDataURL(type?: string, encoderOptions?: any): string;
}
