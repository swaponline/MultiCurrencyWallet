import { request } from 'helpers'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'


export const sign = () => {
  const btcPrivateKey = localStorage.getItem('privateBtcKey')
  const ethPrivateKey = localStorage.getItem('privateEthKey')
  const _ethPrivateKey = actions.ethereum.login(ethPrivateKey)
  actions.bitcoin.login(btcPrivateKey)
  actions.token.login(_ethPrivateKey)
}

export const getBalances = (ethAddress, btcAddress) => {
  actions.ethereum.getBalance(ethAddress)
  actions.bitcoin.getBalance(btcAddress)
  actions.token.getBalance(ethAddress)
}

export const getDemoMoney = () => {
  request.get('https://swap.online/demokeys.php', {})
    .then((r) => {
      localStorage.setItem('privateBtcKey', r[0])
      localStorage.setItem('privateEthKey', r[1])
      global.location.reload()
    })
}

export async function setTransactions(ethAddress, btcAddress) {
  return Promise.all([
    actions.bitcoin.getTransaction(btcAddress),
    actions.ethereum.getTransaction(ethAddress),
    actions.token.getTransaction(ethAddress),
  ]).then(transactions => {
    let data = [].concat([], ...transactions).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    reducers.history.setTransactions(data)
  })
}

