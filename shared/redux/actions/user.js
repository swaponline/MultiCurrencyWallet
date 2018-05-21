import { request } from 'helpers'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'


export const sign = () => {
  const ethPrivateKey = localStorage.getItem('privateEthKey')
  actions.ethereum.login(ethPrivateKey)

  const btcPrivateKey = localStorage.getItem('privateBtcKey')
  actions.bitcoin.login(btcPrivateKey)
}

export async function getBalances(ethAddress, btcAddress) {
  await actions.ethereum.getBalance(ethAddress)
  await actions.bitcoin.getBalance(btcAddress)
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
  ]).then(transactions => {
    let data = [].concat.apply([], ...transactions).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    reducers.history.setTransactions(data)
  })
}
