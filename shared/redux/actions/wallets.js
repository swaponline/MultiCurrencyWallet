export const ADD_WALLET = 'ADD_WALLET'
export const GET_HISTORY = 'GET_HISTORY'
export const UPDATE_BALANCE = 'UPDATE_BALANCE'

export const addWallet = (wallets) => ({
    type: ADD_WALLET,
    wallets
})

export const updateBalance = (balance) => ({
    type: UPDATE_BALANCE,
    balance
})

export const getHistory = (history) => ({
    type: GET_HISTORY,
    history
})

