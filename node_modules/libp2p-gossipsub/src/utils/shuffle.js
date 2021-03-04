'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = void 0;
/**
 * Pseudo-randomly shuffles an array
 *
 * Mutates the input array
 *
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    const randInt = () => {
        return Math.floor(Math.random() * Math.floor(arr.length));
    };
    for (let i = 0; i < arr.length; i++) {
        const j = randInt();
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}
exports.shuffle = shuffle;
