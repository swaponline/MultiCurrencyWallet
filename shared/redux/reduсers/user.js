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
  tokenData:{
    address: '',
    balance: 0,
    currency: 'NOXON',
    contract: {},
  },
}

export const setAuthData = (state, { name, data }) => ({
  ...state,
  [name]: {
    ...state[name],
    ...data,
  },
})

export const setBalance = (state, { name, amount }) => ({
  ...state,
  [name]: {
    ...state[name],
    balance: Number(amount),
  },
})

export const setTokenData = (state, { name, contract }) => ({
  ...state,
  [name]: {
    ...state[name],
    contract,
  },
})
