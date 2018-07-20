export const initialState = {
  ethData: {
    address: '0x0',
    publicKey: '0x0',
    balance: 0,
    currency: 'ETH',
  },
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
