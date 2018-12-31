import stringify from 'json-stringify-safe'


const saver = store => next => action => {
  setTimeout(() => {
    localStorage['redux-store'] = stringify(store.getState(), null, 2)
  }, 0)
  return next(action)
}

export {
  saver,
}
