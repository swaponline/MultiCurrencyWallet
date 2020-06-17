import plugins from 'plugins'


let isLocalStorageEnabled

try {
  window.localStorage.setItem('test', 'test')
  window.localStorage.removeItem('test')
  isLocalStorageEnabled = true
}
catch (e) {
  isLocalStorageEnabled = false
}

const getPluginMethod = (name, data) => {
  if (plugins && plugins[name] && typeof plugins[name] === 'function') {
    return plugins[name](data)
  }
  throw new Error(`plugin code error or plugin function is not exist, check ${name} function in plugins derectory`)
}

const setItem = (key, value) => {
  if (isLocalStorageEnabled) {
    const { setItemPlugin } = window
    if (setItemPlugin) {
      getPluginMethod(setItemPlugin, { key, value })
    } else {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }
}

const getItem = (key) => {
  if (isLocalStorageEnabled) {
    const { getItemPlugin, localStorage } = window
    if (getItemPlugin) {
      return getPluginMethod(getItemPlugin, { key })
    }
    const value = localStorage.getItem(key)

    try {
      return JSON.parse(value)
    }
    catch (err) {
      return value
    }
  }
  return undefined
}

const removeItem = (key) => {
  if (isLocalStorageEnabled) {
    return window.localStorage.removeItem(key)
  }
}

const clear = () => {
  if (isLocalStorageEnabled) {
    window.localStorage.clear()
  }
}

const subscribe = (key, originalListener) => {
  const listener = (event) => {
    if (event.storageArea === window.localStorage && event.key === key) {
      originalListener(event.newValue, event.oldValue)
    }
  }
  window.addEventListener('storage', listener, false)
  return listener
}

const unsubscribe = (listener) => {
  window.removeEventListener('storage', listener, false)
}

export default {
  setItem,
  getItem,
  removeItem,
  clear,
  subscribe,
  unsubscribe,
}
