import config from 'app-config'

export const initialState = {
  pendingQueue: [],
}

export const addHashToQueue = (state, { networkCoin, hash }) => {
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
  const newQueue = state.pendingQueue.slice(1)

  return {
    ...state,
    pendingQueue: newQueue,
  }
}
