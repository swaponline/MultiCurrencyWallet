import { useState } from 'react';
import { CustomLink } from './link';
/**
 * Create the linked local state.
 */
export function useLink(initialState) {
    var _a = useState(initialState), value = _a[0], set = _a[1];
    return new CustomLink(value, set);
}
/**
 * Unwrap object with links, returning an object of a similar shape filled with link values.
 */
export function linksValues(links) {
    return unwrap(links, 'error');
}
/**
 * Unwrap object with links, returning an object of a similar shape filled with link errors.
 */
export function linksErrors(links) {
    return unwrap(links, 'value');
}
/**
 * Assing links with values from the source object.
 * Used for
 *    setLinks({ name, email }, json);
 */
export function setLinks(links, source) {
    for (var _i = 0, _a = Object.keys(links); _i < _a.length; _i++) {
        var key = _a[_i];
        if (source.hasOwnProperty(key)) {
            links[key].set(source[key]);
        }
    }
}
function unwrap(links, field) {
    var values = {};
    for (var _i = 0, _a = Object.keys(links); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = links[key][field];
        if (value !== void 0) {
            values[key] = value;
        }
    }
    return values;
}
//# sourceMappingURL=hooks.js.map