import {JSDOM} from "jsdom"
import {assert} from "chai"
import {subscribe} from "../src/dom"

describe("subscribe", function () {
  it("should emit events", async function () {
    const {window} = new JSDOM()
    const {document} = window

    const anchor = document.createElement("a")

    const task = async () => {
      const events: Event[] = []
      for await (const click of subscribe.call(anchor, "click")) {
        events.push(click)
        if (events.length >= 3) return events
      }
      return []
    }

    const promise = task()
    anchor.click()
    anchor.click()
    anchor.click()

    const result = await promise
    assert.deepEqual(
      [anchor, anchor, anchor],
      result.map(obj => obj.target),
    )
  })
})
