"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_iterator_1 = require("./event-iterator");
exports.EventIterator = event_iterator_1.EventIterator;
function stream(evOptions) {
    return new event_iterator_1.EventIterator(queue => {
        this.addListener("data", queue.push);
        this.addListener("end", queue.stop);
        this.addListener("error", queue.fail);
        queue.on("highWater", () => this.pause());
        queue.on("lowWater", () => this.resume());
        return () => {
            this.removeListener("data", queue.push);
            this.removeListener("end", queue.stop);
            this.removeListener("error", queue.fail);
            /* We are no longer interested in any data; attempt to close the stream. */
            if (this.destroy) {
                this.destroy();
            }
            else if (typeof this.close == "function") {
                ;
                this.close();
            }
        };
    }, evOptions);
}
exports.stream = stream;
exports.default = event_iterator_1.EventIterator;
