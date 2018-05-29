import { request, constants } from 'helpers'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  const _ethPrivateKey = actions.ethereum.login(ethPrivateKey)

  actions.bitcoin.login(btcPrivateKey)
  actions.token.login(_ethPrivateKey)
  await actions.nimiq.login(_ethPrivateKey)
}

const getBalances = (ethAddress, btcAddress) => {
  actions.ethereum.getBalance(ethAddress)
  actions.bitcoin.getBalance(btcAddress)
  actions.token.getBalance(ethAddress)
  actions.nimiq.getBalance()
}

const getDemoMoney = process.env.MAINNET ? () => {} : () => {
  request.get('https://swap.online/demokeys.php', {})
    .then((r) => {
      localStorage.setItem(constants.privateKeyNames.btc, r[0])
      localStorage.setItem(constants.privateKeyNames.eth, r[1])
      global.location.reload()
    })
}

const setTransactions = (ethAddress, btcAddress) =>
  Promise.all([
    actions.bitcoin.getTransaction(btcAddress),
    actions.ethereum.getTransaction(ethAddress),
    actions.token.getTransaction(ethAddress),
  ])
    .then(transactions => {
      let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
      reducers.history.setTransactions(data)
    })


export default {
  sign,
  getBalances,
  getDemoMoney,
  setTransactions,
}
