class StorageFactory {

  prefix: string
  storage: any

  constructor(storage) {
    this.prefix = 'swap:'
    this.storage = storage || global.localStorage

    try {
      this.storage.setItem('test', 'test')
      this.storage.getItem('test')
      this.storage.removeItem('test')
    }
    catch (err) {
      throw new Error(`SwapApp.env.StorageFactory: ${err}`)
    }
  }

  setItem(key, value) {
    this.storage.setItem(`${this.prefix}${key}`, JSON.stringify(value))
  }

  getItem(key) {
    const value = this.storage.getItem(`${this.prefix}${key}`)

    try {
      return JSON.parse(value)
    }
    catch (err) {
      console.error(`SwapApp.env.storage.getItem(${key}) parse error. Looks like the value was created w/o setItem method`)
      console.error(err)
      return undefined
    }
  }

  removeItem(key) {
    return this.storage.removeItem(`${this.prefix}${key}`)
  }
}


export default StorageFactory
