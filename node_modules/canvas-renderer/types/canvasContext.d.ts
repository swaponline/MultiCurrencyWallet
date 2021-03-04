import { Canvas } from "./canvas";

/**
 * Provides a rendering context, partly compatible with the official `CanvasRenderingContext2D`, for drawing shapes on a `Canvas`.
 */
export interface CanvasContext {
    /**
     * Gets the canvas for which the context was created.
     */
    readonly canvas: Canvas;
    /**
     * Specifies the fill color that is used when the fill method is called. Allowed values are:
     * - 32 bit integers on the format 0xRRGGBBAA
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
    fillStyle: number | string;
    /**
     * Saves the current drawing state to a stack. The state can later be restored by calling `CanvasContext.restore()`.
     * 
     * The following state is included when being saved to the stack:
     * - Current transformation matrix
     * - Current fill style
     */
    save(): void;
    /**
     * Restores the last drawing state that was saved with `CanvasContext.save()`, and then removes it from the state stack.
     */
    restore(): void;
    /**
     * Restores the current transformation to the identity matrix.
     */
    resetTransform(): void;
    /**
     * Multiplies the current transformation matrix with the specified values.
     */
    transform(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number
    ): void;
    /**
     * Sets the transformation matrix to the specified matrix.
     */
    setTransform(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number
    ): void;
    /**
     * Applies a translation transformation on top of the current transform.
     * @param x  Distance to move in the horizontal direction in pixels.
     * @param y  Distance to move in the vertical direction in pixels.
     */
    translate(x: number, y: number): void;
    /**
     * Applies a scale transformation on top of the current transform.
     * @param x  Scale in the horizontal direction. `1` means no horizontal scaling.
     * @param y  Scale in the vertical direction. `1` means no vertical scaling.
     */
    scale(x: number, y: number): void;
    /**
     * Applies a rotation transformation on top of the current transform around the current canvas origo.
     * @param angle  Angle in radians measured clockwise from the positive x axis.
     */
    rotate(angle: number): void;
    /**
     * Removes all existing subpaths and begins a new path.
     */
    beginPath(): void;
    /**
     * Starts a new subpath that begins in the same point as the start and end point of the previous one.
     */
    closePath(): void;
    /**
     * Begins a new subpath by moving the cursor to the specified position.
     * @param x  X coordinate.
     * @param y  Y coordinate.
     */
    moveTo(x: number, y: number): void;
    /**
     * Inserts an edge between the last and specified position.
     * @param x  Target X coordinate.
     * @param y  Target Y coordinate.
     */
    lineTo(x: number, y: number): void;
    /**
     * Adds an arc to the current path.
     * @param x  X coordinate of the center of the arc.
     * @param y  Y coordinate of the center of the arc.
     * @param radius  Radius of the arc.
     * @param startAngle  The angle in radians at which the arc starts, measured clockwise from the positive x axis.
     * @param endAngle  The angle in radians at which the arc end, measured clockwise from the positive x axis.
     * @param anticlockwise  Specifies whether the arc will be drawn counter clockwise. Default is clockwise.
     */
    arc(
        x: number,
        y: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        anticlockwise?: boolean
    ): void;
    /**
     * Fills a specified rectangle with fully transparent black without blending with the background or affecting the current paths.
     * @param x  X coordinate of the left side of the rectangle.
     * @param y  Y coordinate of the top of the rectangle.
     * @param width  Width of the rectangle.
     * @param height  Height of the rectangle.
     */
    clearRect(x: number, y: number, width: number, height: number): void;
    /**
     * Fills a specified rectangle without affecting the current paths.
     * @param x  X coordinate of the left side of the rectangle.
     * @param y  Y coordinate of the top of the rectangle.
     * @param width  Width of the rectangle.
     * @param height  Height of the rectangle.
     */
    fillRect(x: number, y: number, width: number, height: number): void;
    /**
     * Fills the defined paths.
     * @param windingRule  The winding rule to be used for determining
     *     which areas are covered by the current path. Default is `"nonzero"`.
     */
    fill(windingRule?: "nonzero" | "evenodd"): void;
}
