import {EventIterator, EventIteratorOptions} from "./event-iterator"

export function subscribe(
  this: EventTarget,
  event: string,
  options?: AddEventListenerOptions,
  evOptions?: EventIteratorOptions,
): EventIterator<Event> {
  return new EventIterator<Event>(({push}) => {
    this.addEventListener(event, push, options)
    return () => this.removeEventListener(event, push, options)
  }, evOptions)
}

export {EventIterator}
export default EventIterator
