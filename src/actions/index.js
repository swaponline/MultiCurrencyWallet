export const ADD_WALLET = 'ADD_WALLET'
export const SET_FILTER = 'SET_FILTER'
export const REQUEST_HISTORY = 'REQUEST_HISTORY'
export const GET_HISTORY = 'GET_HISTORY'
export const OPEN_MODALS = 'OPEN_MODALS'
export const CLOSE_MODALS = 'CLOSE_MODALS'

export const addWallet = (wallets) => ({
    type: ADD_WALLET,
    wallets
})

export const setFilter = (filter) => ({
    type: SET_FILTER,
    filter
})

export const getHistory = (history) => ({
    type: GET_HISTORY,
    history
})

export const openModal = (name, open = true) => ({
    type: OPEN_MODALS,
    name,
    open
})

export const closeModal = () => ({
    type: CLOSE_MODALS
})
