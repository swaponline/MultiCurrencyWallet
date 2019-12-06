export const initialState = {
  currencies: {
    btc: false,
    eth: false,
    usdt: false,
    swap: false,
  },
  usersData: {
    userName: '',
    eMail: '',
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
