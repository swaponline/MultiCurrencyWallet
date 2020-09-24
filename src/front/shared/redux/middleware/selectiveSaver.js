import stringify from 'json-stringify-safe'


const toSaveStates = [
  'rememberedSwaps',
  'user',
  'signUp',
]

const cleanReduxStore = (reduxStore) =>
  Object.keys(reduxStore)
    .reduce((result, key) =>
      toSaveStates.includes(key)
        ? {
          ...result,
          [key]: reduxStore[key],
        }
        : result,
    {})

const selectiveSaver = store => next => async action => {
  next(action)

  const stateName = action.type.split('.')[0]

  if (toSaveStates.includes(stateName)) {
    const data = store.getState()[stateName]
    let reduxStore = localStorage.getItem('redux-store')

    if (reduxStore === null) {
      reduxStore = { [stateName]: data }
    } else {
      reduxStore = cleanReduxStore(JSON.parse(reduxStore))

      if (stateName in reduxStore) {
        reduxStore[stateName] = data
      } else {
        reduxStore = {
          ...reduxStore,
          [stateName]: data,
        }
      }
    }
    localStorage.setItem('redux-store', stringify(reduxStore, null, 2))
  }
}

export {
  selectiveSaver,
}
