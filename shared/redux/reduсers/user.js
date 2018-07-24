const initEthData = {
  address: '0x0',
  publicKey: '0x0',
  balance: 0,
  currency: 'ETH',
}

export const initialState = {
  ethData: initEthData,
  btcData: {
    address: '0x0',
    publicKey: '0x0',
    balance: 0,
    currency: 'BTC',
  },
  nimData: {
    address: '',
    balance: 0,
    currency: 'NIM',
  },
  eosData: {
    address: '',
    balance: 0,
    currency: 'EOS',
  },
  tokensData: {},
  metaMask: {
    exists: false,
    loggedIn: false,
    address: null,
  },
}

export const setAuthData = (state, { name, data }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
  },
  [name]: {
    ...state[name],
    ...data,
  },
})

export const resetEthData = (state) => {
  console.log(Object.assign({}, state, {
    ethData: Object.assign({}, initEthData),
  }))
  return Object.assign({}, state, {
    ethData: Object.assign({}, initEthData),
  })
}

export const setTokenAuthData = (state, { name, data }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state[name],
      ...data,
    },
  },
})

export const setBalance = (state, { name, amount }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
  },
  [name]: {
    ...state[name],
    balance: Number(amount),
  },
})

export const setTokenBalance = (state, { name, amount }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state.tokensData[name],
      balance: Number(amount),
    },
  },
})

export const setMetaMaskData = (state, { name, value }) => {
  return {
    ...state,
    metaMask: {
      ...state.metaMask,
      [name]: value
    }
  }
}

export const setTokenApprove = (state, { name, approve }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state.tokensData[name],
      approve,
    },
  },
})
