import user from 'instances/user'
import reducers from 'redux/core/reducers'

export const setWallets = () => {
  user.getData()
    .then(data => reducers.wallets.setWallets(data))
}

export const getHistory = () => {
  user.getTransactions()
    .then(data =>
      reducers.history.getHistory(data, false))
}
