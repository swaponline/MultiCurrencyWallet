"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_iterator_1 = require("./event-iterator");
exports.EventIterator = event_iterator_1.EventIterator;
function subscribe(event, options, evOptions) {
    return new event_iterator_1.EventIterator(({ push }) => {
        this.addEventListener(event, push, options);
        return () => this.removeEventListener(event, push, options);
    }, evOptions);
}
exports.subscribe = subscribe;
exports.default = event_iterator_1.EventIterator;
