import { request, constants, api, cacheStorageGet, cacheStorageSet } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import qtum from 'helpers/qtum'
import reducers from 'redux/core/reducers'


const login = (privateKey) => {
  let data

  if (privateKey) {
    data = qtum.restoreWallet(privateKey)
  }
  else {
    console.info('Created account Qtum ...')
    data = qtum.createWallet(privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.qtum, data.privateKey)

  // on old reducer store, not saved this, fix store data
  data.currency = "QTUM"
  data.fullName = "Qtum"

  reducers.user.setAuthData({ name: 'qtumData', data })

  window.getQtumAddress = () => data.address

  console.info('Logged in with Qtum', data)

  return data.privateKey
}

const getBalance = () => {
  const { user: { qtumData: { address } } } = getState()

  const balanceInCache = cacheStorageGet('currencyBalances', `qtum_${address}`)

  if (balanceInCache !== false) {
    return balanceInCache
  }

  return qtum.getBalance()
    .then((amount) => {
      cacheStorageSet('currencyBalances', `qtum_${address}`, amount, 30)
      reducers.user.setBalance({ name: 'qtumData', amount })
      return amount
    })
    .catch((err) => {
      console.error(err)
      reducers.user.setBalanceError({ name: 'qtumData' })
    })
}

const send = ({ to, amount } = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const txId = await qtum.sendMoney(to, amount)

      resolve()
    }
    catch (err) {
      console.error(err)
      reject(err)
    }
  })


export default {
  login,
  getBalance,
  send,
}
