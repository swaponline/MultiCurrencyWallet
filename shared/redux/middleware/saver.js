import stringify from 'json-stringify-safe'


const saver = store => next => action => {
  localStorage['redux-store'] = stringify(store.getState(), null, 2)
  return next(action)
}

export {
  saver,
}
