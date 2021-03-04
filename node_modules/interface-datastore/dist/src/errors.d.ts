/**
 * @param {Error} [err]
 */
export function dbOpenFailedError(err?: Error | undefined): Error & errCode.Extensions;
/**
 * @param {Error} [err]
 */
export function dbDeleteFailedError(err?: Error | undefined): Error & errCode.Extensions;
/**
 * @param {Error} [err]
 */
export function dbWriteFailedError(err?: Error | undefined): Error & errCode.Extensions;
/**
 * @param {Error} [err]
 */
export function notFoundError(err?: Error | undefined): Error & errCode.Extensions;
/**
 * @param {Error} [err]
 */
export function abortedError(err?: Error | undefined): Error & errCode.Extensions;
import errCode = require("err-code");
//# sourceMappingURL=errors.d.ts.map