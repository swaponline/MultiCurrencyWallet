// @ts-nocheck
import reducers from 'redux/core/reducers'
import TronWeb from 'tronweb'
import config from 'helpers/externalConfig'
import { getState } from 'redux/core'
import axios from 'axios'


let tronWeb = null

const login = (
  privateKey,
  mnemonic: string | null = null,
) => {

console.log('config.web3.tron_provider', config.web3.tron_provider, config.web3.tron_apikey, config)
  tronWeb = new TronWeb({
    fullHost: config.web3.tron_provider,
    privateKey: privateKey.replace(`0x`,``),
  })
  //tronWeb.setHeader({"TRON-PRO-API-KEY": config.web3.tron_apikey});
  console.log('tronweb', tronWeb)
  window.tweb = tronWeb
/*
  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    // keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.info('Created account Bitcoin ...')
    // keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    // privateKey  = keyPair.toWIF()
    // use random 12 words
    //@ts-ignore: strictNullChecks
    if (!mnemonic) mnemonic = bip39.generateMnemonic()

    //@ts-ignore: strictNullChecks
    const accData = getWalletByWords(mnemonic)

    privateKey = accData.WIF
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

  const data = {
    ...auth(privateKey),
    isBTC: true,
  }
  */

  //window.getBtcAddress = () => data.address
  //window.getBtcData = () => data
  const data = {
    address: tronWeb.defaultAddress.base58
  }

  reducers.user.setAuthData({ name: 'trxData', data })

  return true //privateKey
}

const getBalance = () => {
  const {
    user: {
      trxData: {
        address,
      },
    },
  } = getState()
  
  return new Promise((resolve) => {
    fetchBalance(address).then((answer) => {
      // @ts-ignore
      const { balance } = answer
      reducers.user.setBalance({
        name: 'trxData',
        amount: balance
      })
      resolve(balance)
    }).catch((e) => {
      reducers.user.setBalanceError({ name: 'trxData' })
      resolve(-1)
    })
  })
}

const fetchBalance = (address) => {
  return new Promise((resolve, reject) => {
    if (tronWeb !== null) {
      // @ts-ignore
      tronWeb.trx.getBalance(address).then((answer) => {
        console.log('>>> trx getBalance', address, answer)
        resolve({
          balance: tronWeb.fromSun(answer),
        })
      }).catch((err) => {
        reject(err)
      })
    } else {
      resolve({ balance: 0 })
    }
  })
}

const getAllMyAddresses = () => {
  const {
    user: {
      trxData,
    },
  } = getState()
  return [ trxData.address ]
}

const getTransaction = (address = ``, ownType = ``) => {
  const {
    user: {
      trxData: {
        address: ownerAddress,
      },
    },
  } = getState()

  address = address || ownerAddress
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `${config.api.tronwebapi}v1/accounts/${address}/transactions`,
      headers: {accept: 'application/json'}
    }

    axios
      .request(options)
      .then(function (response) {
        const { data: result } = response
        if (result.success && result.data) {
          const txs = result.data.filter((txInfo) => {
            if (txInfo.raw_data && txInfo.raw_data.contract && txInfo.raw_data.contract.length) {
              return true
            }
          }).map((txInfo) => {
            console.log('>>>> txInfo', txInfo)
            const {
              raw_data: {
                contract: {
                  0: info,
                  0: {
                    parameter: {
                      value: {
                        amount,
                        owner_address: owner_address_hex,
                        to_address: to_address_hex,
                      },
                    },
                  },
                },
                timestamp,
              },
              txID,
            } = txInfo
            
            const owner_address = tronWeb.address.fromHex(owner_address_hex)
            const to_address = tronWeb.address.fromHex(to_address_hex)
            
            console.log(txID, timestamp, info, address, amount, to_address, to_address_hex, owner_address_hex)
            return {
              type: `TRX`,
              confirmations: 1,
              hash: txID,
              status: true,
              value: tronWeb.fromSun(amount),
              address: to_address,
              canEdit: address === ownerAddress,
              date: timestamp,
              direction: (address.toLowerCase() === to_address.toLowerCase()) ? 'in' : 'out',
            }
          })
          console.log(txs)
          resolve(txs)
        }
        console.log('>> getTransaction', response.data);
      })
      .catch(function (error) {
        console.error('>> getTransaction error', error);
      })

  })
}

const fetchTxInfo = (hash) => {
  console.log('>>> fetchTxInfo', hash)
  return new Promise((res, rej) => {
    tronWeb.trx.getTransaction(hash)
      .then((answer) => {
        console.log('>>> fetchTxInfo answer', answer)
        if (answer && answer.raw_data) {
          const {
            raw_data: {
              contract: {
                0: info,
                0: {
                  parameter: {
                    value: {
                      amount,
                      owner_address: owner_address_hex,
                      to_address: to_address_hex,
                    },
                  },
                },
              },
              expiration,
              timestamp,
            },
            txID,
          } = answer
          const owner_address = tronWeb.address.fromHex(owner_address_hex)
          const to_address = tronWeb.address.fromHex(to_address_hex)

          res({
            amount: tronWeb.fromSun(amount),
            afterBalance: null,
            receiverAddress: to_address,
            senderAddress: owner_address,
            minerFee: 0,
            minerFeeCurrency: `trx`,
            adminFee: 0,
            confirmed: true,
          })
        } else {
          rej(false)
        }
      })
      .catch((error) => {
        console.log('>>> fetchTxInfo error', error)
        rej(error)
      })
  })
}

const isContract = async (address) => {
  return false
}

const send = async (params): Promise<{ transactionHash: string } | Error> => {
  const {
    to,
    amount = 0,
    gasLimit: customGasLimit,
    speed,
    data,
    waitReceipt = false,
  } = params
  let { gasPrice } = params
  console.log('>>> do send', params)
  const {
    user: {
      trxData: {
        address: ownerAddress,
      },
    },
  } = getState()
  
  const recipientIsContract = await isContract(to)
  
  let sendMethod = tronWeb.trx.sendTransaction
  console.log('>> sendMethod', sendMethod)
  let txData: any = {
    data: data || undefined,
    from: ownerAddress,
    to: to.trim(),
    gasPrice: 0 ,
    value: tronWeb.toSun(amount),
  }
  console.log(txData)
  return new Promise((res, rej) => {
    tronWeb.trx.sendTransaction(to, tronWeb.toSun(amount))
      .then((result) => {
        console.log('>>> result', result)
        if (result && result.result && result.txid) {
          const { txid: hash } = result
          reducers.transactions.addTransactionToQueue({
            networkCoin: `trx`,
            hash,
          })

          if (!waitReceipt) {
            res({ transactionHash: hash })
          }
        } else {
          rej(false)
        }
      })
      .catch((error) => {
        rej(error)
      })
  })
}

export default {
  login,
  getBalance,
  fetchBalance,
  getAllMyAddresses,
  getTransaction,
  send,
  fetchTxInfo,
}