import { config, request } from 'helpers'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import actions from 'redux/actions'

// let gas

export const login = (privateKey) => {
  let data
  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  } else {
    console.info('Created account Ethereum ...')
    data = web3.eth.accounts.create()
    web3.eth.accounts.wallet.add(data)
  }

  web3.eth.accounts.wallet.add(data.privateKey)
  console.info('Logged in with Ethereum', data)

  reducers.user.setAuthData({ name: 'ethData', data })
  return data.privateKey
}

export const getBalance = (address) =>
  web3.eth.getBalance(address)
    .then(wei => {
      const amount = Number(web3.utils.fromWei(wei))
      console.log('ETH Balance:', amount)
      reducers.user.setBalance({ name: 'ethData', amount })
    }).catch(r => console.log('app:showError', 'Ethereum service isn\'t available, try later'))


// export const getGas = () => {
//   web3.eth.getGasPrice().then((res) => {
//     gas = web3.utils.fromWei(res)
//   })
// }

export const getTransaction = (address) =>
  new Promise((resolve) => {
    const url = `${config.api.ethpay}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.blocktrail}`
    let transactions

    request.get(url)
      .then((res) => {
        console.log('res', res)
        if (res.status) {
          transactions = res.result
            .filter((item) => item.value > 0).map((item) => ({
              type: 'eth',
              status: item.blockHash != null ? 1 : 0,
              value: web3.utils.fromWei(item.value),
              address: item.to,
              date: new Date(item.timeStamp * 1000).toLocaleString('en-US', config.date),
              direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
            }))
          resolve(transactions)
        } else { console.error('res:status ETH false', res) }
      })
  })

export const send = (from, to, amount, privateKey) =>
  // await getGas()
  new Promise((resolve, reject) => {
    web3.eth.getBalance(from).then((r) => {
      try {
        let balance = web3.utils.fromWei(r)

        if (balance === 0) {
          reject('Your balance is empty')
          return
        }

        const t = {
          from,
          to,
          gasPrice: '20000000000',
          gas: '21000',
          value: web3.utils.toWei(`${amount}`),
        }

        web3.eth.accounts.signTransaction(t, privateKey)
          .then((result) => web3.eth.sendSignedTransaction(result.rawTransaction))
          .then((receipt) => {
            resolve(receipt)
          })
          .catch(error => console.error(error))
      }
      catch (e) {
        console.error(e)
      }
    })
  })

