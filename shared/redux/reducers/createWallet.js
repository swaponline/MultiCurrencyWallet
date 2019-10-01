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
  console.log(({
    ...state,
    [type]: data,
  }))
  return ({
    ...state,
    [type]: data,
  })
}
