import BigInteger from 'bigi'
import { BigNumber } from 'bignumber.js'

import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import bitcoin from 'bitcoinjs-lib'
import { btc, request, constants, api } from 'helpers'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: btc.network })
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    privateKey  = keyPair.toWIF()
  }

  const account     = new bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const address     = account.getAddress()
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  console.info('Logged in with USDT', data)
  reducers.user.setAuthData({ name: 'usdtData', data })
}

const getBalance = async () => {
  const { user: { usdtData: { address } } } = getState()

  const balance = await fetchBalance(address)

  reducers.user.setBalance({ name: 'usdtData', amount: balance })
  return balance
}

const fetchBalance = (address, assetId = 31) =>
  request.post(`https://api.omniexplorer.info/v1/address/addr/`, {
    body: `addr=${address}`,
  })
    .then(response => {
      const { error, balance } = response

      if (error) throw new Error(`Omni Balance: ${error} at ${address}`)

      const findById = balance
        .filter(asset => parseInt(asset.id) === assetId || asset.id === assetId)

      if (!findById.length) {
        return 0
      }

      console.log('Omni Balance:', findById[0].value)
      console.log('Omni Balance pending:', findById[0].pendingpos)
      console.log('Omni Balance pending:', findById[0].pendingneg)

      const usdsatoshis = BigNumber(findById[0].value)

      if (usdsatoshis) {
        return usdsatoshis.dividedBy(1e8).toNumber()
      }
      return 0

    })
    .catch(error => console.error(error))

export default {
  login,
  getBalance,
  fetchBalance,
}
