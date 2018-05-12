let isLocalStorageEnabled

try {
  window.localStorage.setItem('test', 'test')
  window.localStorage.removeItem('test')
  isLocalStorageEnabled = true
}
catch (e) {
  isLocalStorageEnabled = false
}


const setItem = (key, value) => {
  if (isLocalStorageEnabled) {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

const getItem = (key) => {
  if (isLocalStorageEnabled) {
    const value = window.localStorage.getItem(key)

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

export default {
  setItem,
  getItem,
  removeItem,
  clear,
}
