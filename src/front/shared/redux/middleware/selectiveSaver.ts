//@ts-nocheck
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
      //@ts-nocheck
      reduxStore = { [stateName]: data }
    } else {
      //@ts-nocheck
      reduxStore = cleanReduxStore(JSON.parse(reduxStore))
      //@ts-nocheck
      if (stateName in reduxStore) {
        //@ts-nocheck
        reduxStore[stateName] = data
      } else {
        reduxStore = {
          //@ts-nocheck
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
