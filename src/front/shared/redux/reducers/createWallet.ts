export const initialState = {
  currencies: {
    btc: false,
    eth: false,
    bnb: false,
    matic: false,
    arbeth: false,
    aureth: false,
    xdai: false,
    ftm: false,
    avax: false,
    movr: false,
    one: false,
    ame: false,
    phi_v1: false,
    phi: false,
    fkw: false,
    phpx: false,
    ghost: false,
    next: false,
    '{eth}usdt': false,
    '{eth}swap': false,
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
