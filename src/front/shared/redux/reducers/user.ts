export const initialState = {
  ghostData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'GHOST',
    fullName: 'ghost',
    balanceError: null,
    infoAboutCurrency: null,
  },
  nextData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'NEXT',
    fullName: 'next',
    balanceError: null,
    infoAboutCurrency: null,
  },
  ethData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'ETH',
    fullName: 'Ethereum',
    balanceError: null,
    infoAboutCurrency: null,
  },
  bnbData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BNB',
    fullName: 'Binance Coin',
    balanceError: null,
    infoAboutCurrency: null,
  },
  maticData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'MATIC',
    fullName: 'MATIC Token',
    balanceError: null,
    infoAboutCurrency: null,
  },
  arbethData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'ARBETH',
    fullName: 'Arbitrum ETH',
    balanceError: null,
    infoAboutCurrency: null,
  },
  aurethData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'AURETH',
    fullName: 'Aurora ETH',
    balanceError: null,
    infoAboutCurrency: null,
  },
  xdaiData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'XDAI',
    fullName: 'xDai',
    balanceError: null,
    infoAboutCurrency: null,
  },
  ftmData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'FTM',
    fullName: 'Fantom',
    balanceError: null,
    infoAboutCurrency: null,
  },
  avaxData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'AVAX',
    fullName: 'Avalanche',
    balanceError: null,
    infoAboutCurrency: null,
  },
  movrData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'MOVR',
    fullName: 'Moonriver',
    balanceError: null,
    infoAboutCurrency: null,
  },
  oneData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'ONE',
    fullName: 'Harmony One',
    balanceError: null,
    infoAboutCurrency: null,
  },
  phiData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'PHI',
    fullName: 'PHI',
    balanceError: null,
    infoAboutCurrency: null,
  },
  ameData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'AME',
    fullName: 'AME',
    balanceError: null,
    infoAboutCurrency: null,
  },
  btcData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC',
    fullName: 'Bitcoin',
    balanceError: null,
    infoAboutCurrency: null,
  },
  btcMultisigSMSData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (SMS-Protected)',
    fullName: 'Bitcoin (SMS)',
    balanceError: null,
    infoAboutCurrency: null,
  },
  btcMultisigPinData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (PIN-Protected)',
    fullName: 'Bitcoin (PIN)',
    balanceError: null,
    infoAboutCurrency: null,
  },
  btcMultisigG2FAData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Google 2FA)',
    fullName: 'Bitcoin (Google 2FA)',
    balanceError: null,
    infoAboutCurrency: null,
  },
  btcMultisigUserData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Multisig)',
    fullName: 'Bitcoin (Multisig)',
    balanceError: null,
    infoAboutCurrency: null,
  },
  /*
  usdtData: {
    address: '0x0', // ? for what
    publicKey: '0x0', // ?
    balance: 0,
    isBalanceFetched: false,
    currency: 'USDT',
    fullName: 'Tether',
    balanceError: null,
  },
  */
  tokensData: {},
  isFetching: false,
  isBalanceFetching: false,
  isTokenSigned: false,
  activeFiat: window.DEFAULT_FIAT || 'USD',
  activeCurrency: 'BTC',
  multisigStatus: {},
  multisigPendingCount: 0,
  metamaskData: false,
}

export const updateMultisigStatus = (state, { address, last, total }) => {
  let totalPending = 0
  if (state.multisigStatus) {
    Object.keys(state.multisigStatus).map((savedAddress) => {
      if (address !== savedAddress) totalPending += state.multisigStatus[savedAddress].count
    })
  }

  totalPending += total

  return {
    ...state,
    multisigPendingCount: totalPending,
    multisigStatus: {
      ...(state.multisigStatus ? state.multisigStatus : {}),
      [address] : {
        address,
        pending: last,
        count: total,
      },
    },
  }
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

export const setTokenAuthData = (state, { name, baseCurrency, data }) => {
  const tokenKey = `{${baseCurrency}}${name}`

  return {
    ...state,
    tokensData: {
      ...state.tokensData,
      [tokenKey]: {
        ...state.tokensData[tokenKey],
        ...data,
      },
    },
  }
}

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
    ...state,
  }
}

export const setBalance = (state, { name, amount, unconfirmedBalance }) => ({
  ...state,
  [name]: {
    ...state[name],
    balance: Number(amount),
    unconfirmedBalance,
    isBalanceFetched: true,
    balanceError: false,
  },
})

export const setInfoAboutToken = (state, { name, baseCurrency, infoAboutCurrency }) => {
  const tokenKey = `{${baseCurrency}}${name}`

  return {
    ...state,
    tokensData: {
      ...state.tokensData,
      [tokenKey]: {
        ...state.tokensData[tokenKey],
        infoAboutCurrency,
      },
    },
  }
}

export const setInfoAboutCurrency = (state, { name, infoAboutCurrency }) => ({
  ...state,
  [name]: {
    ...state[name],
    infoAboutCurrency,
  },
})

export const setBalanceError = (state, { name }) => ({
  ...state,
  [name]: {
    ...state[name],
    balanceError: true,
  },
})

export const setTokenBalanceError = (state, { name, baseCurrency }) => {
  const tokenKey = `{${baseCurrency}}${name}`

  return {
    ...state,
    tokensData: {
      ...state.tokensData,
      [tokenKey]: {
        ...state.tokensData[tokenKey],
        balanceError: true,
      },
    },
  }
}

export const setTokenBalance = (state, { name, baseCurrency, amount }) => {
  const tokenKey = `{${baseCurrency}}${name}`

  return {
    ...state,
    tokensData: {
      ...state.tokensData,
      [tokenKey]: {
        ...state.tokensData[tokenKey],
        balance: Number(amount),
        isBalanceFetched: true,
        balanceError: false,
      },
    },
  }
}

export const setIsBalanceFetching = (state, { isBalanceFetching }) => ({
  ...state,
  isBalanceFetching,
})

export const setIsFetching = (state, { isFetching }) => ({
  ...state,
  isFetching,
})

export const setActiveCurrency = (state, { activeCurrency }) => ({ ...state, activeCurrency })

export const setActiveFiat = (state, { activeFiat }) => ({ ...state, activeFiat })
