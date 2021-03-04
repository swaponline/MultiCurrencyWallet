import {Readable} from "stream"
import {EventIterator, EventIteratorOptions} from "./event-iterator"

export function stream(
  this: Readable,
  evOptions?: EventIteratorOptions,
): EventIterator<Buffer> {
  return new EventIterator<Buffer>(queue => {
    this.addListener("data", queue.push)
    this.addListener("end", queue.stop)
    this.addListener("error", queue.fail)

    queue.on("highWater", () => this.pause())
    queue.on("lowWater", () => this.resume())

    return () => {
      this.removeListener("data", queue.push)
      this.removeListener("end", queue.stop)
      this.removeListener("error", queue.fail)

      /* We are no longer interested in any data; attempt to close the stream. */
      if (this.destroy) {
        this.destroy()
      } else if (typeof (this as any).close == "function") {
        ;(this as any).close()
      }
    }
  }, evOptions)
}

export {EventIterator}
export default EventIterator
