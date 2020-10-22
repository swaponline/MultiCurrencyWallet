export const initialState = {
  currencies: {
    btc: false,
    eth: false,
    ghost: false,
    next: false,
    usdt: false,
    swap: false,
  },
  usersData: {
    userName: '',
    eMail: '',
  },
  step: 1,
  secure: 'withoutSecure',
}


export const newWalletData = (state, { stateKey, value }) => {
console.log('newWalletData', stateKey, value)
console.log('oldState', state)
  const newState = {
    ...state,
    [stateKey]: value,
  }
console.log('newState', newState)
  return newState
}
