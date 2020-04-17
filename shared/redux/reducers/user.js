export const initialState = {
  ethData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'ETH',
    fullName: 'Ethereum',
    balanceError: null,
    infoAboutCurrency: null
  },
  btcData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC',
    fullName: 'Bitcoin',
    balanceError: null,
    infoAboutCurrency: null
  },
  btcMultisigSMSData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (SMS-Protected)',
    fullName: 'Bitcoin (SMS-Protected)',
    balanceError: null,
    infoAboutCurrency: null
  },
  btcMultisigG2FAData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Google 2FA)',
    fullName: 'Bitcoin (Google 2FA)',
    balanceError: null,
    infoAboutCurrency: null
  },
  btcMultisigUserData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Multisig)',
    fullName: 'Bitcoin (Multisig)',
    balanceError: null,
    infoAboutCurrency: null
  },
  usdtData: {
    address: '0x0',
    publicKey: '0x0',
    balance: 0,
    isBalanceFetched: false,
    currency: 'USDT',
    fullName: 'Tether',
    balanceError: null,
  },
  tokensData: {},
  isFetching: false,
  isTokenSigned: false,
}

export const addWallet = (state, { name, data }) => ({
  ...state,
  [name]: {
    ...data,
  },
})

export const setAuthData = (state, { name, data }) => ({
  ...state,
  [name]: {
    ...state[name],
    ...data,
  },
})

export const setTokenSigned = (state, booleanValue) => ({
  ...state,
  isTokenSigned: booleanValue,
})

export const setTokenAuthData = (state, { name, data }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state.tokensData[name],
      ...data,
    },
  },
})

export const setBtcMultisigBalance = (state, { address, amount, unconfirmedBalance }) => {
  state.btcMultisigUserData.wallets.forEach((wallet) => {
    if (wallet.address === address) {
      wallet.balance = Number(amount)
      wallet.unconfirmedBalance = unconfirmedBalance
      wallet.isBalanceFetched = true
      wallet.balanceError = false
    }
  })
  return {
    ...state
  }
}

export const setBalance = (state, { name, amount, unconfirmedBalance }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
  },
  [name]: {
    ...state[name],
    balance: Number(amount),
    unconfirmedBalance,
    isBalanceFetched: true,
    balanceError: false,
  },
})


export const setInfoAboutCurrency = (state, { name, infoAboutCurrency }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
  },
  [name]: {
    ...state[name],
    infoAboutCurrency
  },
})

export const setBalanceError = (state, { name }) => ({
  ...state,
  [name]: {
    ...state[name],
    balanceError: true,
  },
})

export const setTokenBalanceError = (state, { name }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state.tokensData[name],
      balanceError: true,
    },
  },
})

export const setTokenBalance = (state, { name, amount }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
    [name]: {
      ...state.tokensData[name],
      balance: Number(amount),
      isBalanceFetched: true,
      balanceError: false,
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

export const setIsFetching = (state, { isFetching }) => ({
  ...state,
  isFetching
})

export const setReputation = (state, { name, reputation, reputationOracleSignature }) => ({
  ...state,
  tokensData: {
    ...state.tokensData,
  },
  [name]: {
    ...state[name],
    reputation: Number(reputation),
    reputationProof: reputationOracleSignature,
  },
})
