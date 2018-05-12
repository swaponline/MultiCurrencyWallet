import Events, { events } from './Events'
import { localStorage, ignoreProps } from './util'


class Storage {

  constructor({ data, storeKey } = {}) {
    this.storeKey = storeKey
    this.events = new Events()

    if (data) {
      this._update(data)
    }

    this._persistState()
  }

  _persistState() {
    if (this.storeKey) {
      const data = localStorage.getItem(this.storeKey)

      this._update(data)
    }
  }

  _update(values) {
    if (values) {
      Object.keys(values).forEach((key) => {
        this[key] = values[key]
      })
    }
  }

  update(values) {
    this._update(values)

    const data = ignoreProps(this, 'events', 'storeKey')

    if (this.storeKey) {
      localStorage.setItem(this.storeKey, data)
    }

    events.dispatch('new storage values', values)
    events.dispatch('storage update', data)
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}

const storage = new Storage()


export default Storage

export {
  storage,
}
