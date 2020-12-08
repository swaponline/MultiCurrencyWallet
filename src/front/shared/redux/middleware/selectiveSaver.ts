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
  try {
    next(action)
  } catch (error) {
    console.log('Redux middleware - selectiveSaver')
    console.log(error)
  }

  const stateName = action.type.split('.')[0]

  if (toSaveStates.includes(stateName)) {
    const data = store.getState()[stateName]
    let reduxStore = localStorage.getItem('redux-store')

    if (reduxStore === null) {
      //@ts-ignore
      reduxStore = { [stateName]: data }
    } else {
      //@ts-ignore
      reduxStore = cleanReduxStore(JSON.parse(reduxStore))
      //@ts-ignore
      if (stateName in reduxStore) {
        //@ts-ignore
        reduxStore[stateName] = data
      } else {
        reduxStore = {
          //@ts-ignore
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
