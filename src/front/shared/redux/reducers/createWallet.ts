export const initialState = {
  currencies: {
    btc: false,
    eth: false,
    bnb: false,
    ghost: false,
    next: false,
    usdt: false,
    swap: false,
  },
  secure: '',
  step: 1,
}


export const newWalletData = (state, payload) => {
  const { type, data } = payload

  return ({
    ...state,
    [type]: data,
  })
}
