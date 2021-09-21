import config from 'app-config'

export const initialState = {
  pendingQueue: [],
}

export const addHashToQueue = (state, { networkCoin, hash }) => {
  console.log('%c addHashToQueue', 'color:orange;font-size:20px')
  console.log('state: ', state)
  console.log('networkCoin: ', networkCoin)
  console.log('hash: ', hash)
  const networkData = config.evmNetworks[networkCoin.toUpperCase()]

  return {
    ...state,
    pendingQueue: [
      ...state.pendingQueue,
      {
        networkData,
        hash,
      },
    ],
  }
}

export const removeHashFromQueue = (state) => {
  console.log('%c removeHashFromQueue', 'color:orange;font-size:20px')
  const newQueue = state.pendingQueue.slice(1)
  console.log('newQueue: ', newQueue)
  
  return {
    ...state,
    pendingQueue: newQueue,
  }
}
