import { env } from './env'


let _isLocalStorageEnabled = null

const isLocalStorageEnabled = () => {
  if (_isLocalStorageEnabled === null) {
    try {
      env.localStorage.setItem('test', 'test')
      env.localStorage.removeItem('test')
      _isLocalStorageEnabled = true
    }
    catch (e) {
      _isLocalStorageEnabled = false
    }
  }

  return _isLocalStorageEnabled
}


const setItem = (key, value) => {
  if (isLocalStorageEnabled()) {
    env.localStorage.setItem(key, JSON.stringify(value))
  }
}

const getItem = (key) => {
  if (isLocalStorageEnabled()) {
    const value = env.localStorage.getItem(key)

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
  if (isLocalStorageEnabled()) {
    return env.localStorage.removeItem(key)
  }
}

const clear = () => {
  if (isLocalStorageEnabled()) {
    env.localStorage.clear()
  }
}


export default {
  setItem,
  getItem,
  removeItem,
  clear,
}
