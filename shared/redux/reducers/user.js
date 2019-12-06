export const initialState = {
  ethData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'ETH',
    fullName: 'Ethereum',
    balanceError: null,
  },
  btcData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC',
    fullName: 'Bitcoin',
    balanceError: null,
  },
  btcMultisigSMSData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (SMS-Protected)',
    fullName: 'Bitcoin (SMS-Protected)',
    balanceError: null,
  },
  btcMultisigG2FAData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Google 2FA)',
    fullName: 'Bitcoin (Google 2FA)',
    balanceError: null,
  },
  btcMultisigUserData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BTC (Multisig)',
    fullName: 'Bitcoin (Multisig)',
    balanceError: null,
  },
  bchData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'BCH',
    fullName: 'BitcoinCash',
    balanceError: null,
  },
  /*
  xlmData: {
    balance: 0,
    currency: 'XLM',
    fullName: 'Stellar',
    balanceError: null,
  },
  */
  ltcData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'LTC',
    fullName: 'Litecoin',
    balanceError: null,
  },
  /*
  usdtData: {
    address: '0x0',
    publicKey: '0x0',
    balance: 0,
    isBalanceFetched: false,
    currency: 'USDT',
    fullName: 'USDT',
    balanceError: null,
  },
  */
  nimData: {
    balance: 0,
    isBalanceFetched: false,
    currency: 'NIM',
    fullName: 'Nimiq',
    balanceError: null,
  },
  eosData: {
    balance: 0,
    address: '',
    isAccountActivated: false,
    isActivationPaymentSent: false,
    isBalanceFetched: true,
    currency: 'EOS',
    fullName: 'Eos',
    balanceError: null,
  },
  telosData: {
    balance: 0,
    address: '',
    isBalanceFetched: true,
    currency: 'TLOS',
    fullName: 'Telos',
    balanceError: null,
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
      ...state.tokensData[name],
      ...data,
    },
  },
})

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
