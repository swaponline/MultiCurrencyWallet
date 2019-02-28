const tokensWithNoLogo = ['DEB', 'GUSD', 'JOT', 'NOXON', 'MBRS', 'TLOS', 'SCT', 'BTRM', 'BNTY', 'PBL', 'SENC', 'STAR', 'LOC', 'KEY', 'DAI', 'AVT', 'HBT', 'VIEW', 'CS', 'PIX', 'GEN', 'GAI', 'EMTV', 'CGC', 'VITE', 'MOT', 'DOV', 'XBX', 'LIF', 'TIME', 'MTH', 'CBT', 'DDM', 'WBTC', 'ABYSS'] // eslint-disable-line

export const initialState = {
  orders: [],
  filter: 'btc-swap',
  hiddenCoinsList: JSON.parse(localStorage.getItem('hiddenCoinsList')) || tokensWithNoLogo,
}

export const getOrders = (state, {  orders }) => ({
  ...state,
  orders,
})

export const setFilter = (state, { filter }) => ({
  ...state,
  orders: [
    ...state.orders,
  ],
  filter,
})

export const markCoinAsHidden = (state, coin) => ({
  ...state,
  hiddenCoinsList: [
    ...state.hiddenCoinsList,
    coin,
  ],
})
export const markCoinAsVisible = (state, coin) => ({
  ...state,
  hiddenCoinsList: state.hiddenCoinsList.filter(c => c !== coin),
})
