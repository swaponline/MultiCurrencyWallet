import {
  GET_WALLET,
  GET_HISTORY,
  GET_HISTORY_REQUEST,
  GET_WALLET_REQUEST,
} from '../constants'

import User from '../../instances/user'

export function addWallet() {
  return dispatch => {
    dispatch({
      type: GET_WALLET_REQUEST,
    })

    User.getData()
      .then(data => dispatch({
        type: GET_WALLET,
        payload: data,
      }))
  }
}

export function getHistory() {
  return dispatch => {
    dispatch({
      type: GET_HISTORY_REQUEST,
    })

    User.getTransactions()
      .then(data => dispatch({
        type: GET_HISTORY,
        payload: data,
      }))
  }
}

