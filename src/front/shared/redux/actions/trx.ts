// @ts-nocheck
import reducers from 'redux/core/reducers'
import TronWeb from 'tronweb'
import config from 'helpers/externalConfig'
import { getState } from 'redux/core'
import axios from 'axios'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { constants } from 'helpers'
import getUnixTimeStamp from 'common/utils/getUnixTimeStamp'

let tronWeb = null

const getWeb3 = () => {
  return tronWeb
}

const login = (
  privateKey,
  mnemonic: string | null = null,
) => {


  if (!privateKey) {
    if (!mnemonic) mnemonic = bip39.generateMnemonic()

    const accData =  mnemonicUtils.getTrxWallet({
      mnemonic,
    })
    privateKey = accData.privateKey
  }

  localStorage.setItem(constants.privateKeyNames.trx, privateKey)

  tronWeb = new TronWeb({
    fullHost: config.web3.tron_provider,
    privateKey: privateKey.replace(`0x`,``),
  })
  window.tweb = tronWeb

  const data = {
    address: tronWeb.defaultAddress.base58
  }

  reducers.user.setAuthData({ name: 'trxData', data })

  return privateKey
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
    fetchBalance(address).then((balance) => {
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
      tronWeb.trx.getBalance(address).then((answer) => {
        resolve(tronWeb.fromSun(answer))
      }).catch((err) => {
        reject(err)
      })
    } else {
      resolve(0)
    }
  })
}

const getAllMyAddresses = () => {
  const {
    user: {
      trxData,
    },
  } = getState()
  return [ trxData.address.toLowerCase() ]
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
      headers: {
        accept: 'application/json',
        [`TRON-PRO-API-KEY`]: config.web3.tron_apikey,
      }
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
            //console.log('>>>> txInfo', txInfo)
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
                    type: txType,
                  },
                },
                expiration,
                timestamp,
              },
              txID,
            } = txInfo

            if (txType !== `TransferContract`) return false

            const owner_address = tronWeb.address.fromHex(owner_address_hex)
            const to_address = tronWeb.address.fromHex(to_address_hex)
            
            //console.log(txID, timestamp, info, address, amount, to_address, to_address_hex, owner_address_hex)
            return {
              type: `TRX`,
              confirmations: getUnixTimeStamp() * 1000 >= expiration ? 1 : 0,
              hash: txID,
              status: true,
              value: tronWeb.fromSun(amount),
              address: to_address,
              canEdit: address === ownerAddress,
              date: timestamp,
              direction: (address.toLowerCase() === to_address.toLowerCase()) ? 'in' : 'out',
            }
          }).filter((txInfo) => {
            return txInfo !== false
          })
          console.log(txs)
          resolve(txs)
        }
        //console.log('>> getTransaction', response.data);
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
        //console.log('>>> fetchTxInfo answer', answer)
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
          console.log(getUnixTimeStamp())
          const owner_address = tronWeb.address.fromHex(owner_address_hex)
          const to_address = tronWeb.address.fromHex(to_address_hex)

          tronWeb.trx.getTransactionInfo(hash)
            .then((moreInfo) => {
              //console.log('>>> moreInfo', moreInfo)
              if (moreInfo) {
                res({
                  amount: tronWeb.fromSun(amount),
                  afterBalance: null,
                  receiverAddress: to_address,
                  senderAddress: owner_address,
                  minerFee: tronWeb.fromSun(moreInfo.fee),
                  minerFeeCurrency: `trx`,
                  adminFee: 0,
                  confirmed: getUnixTimeStamp() * 1000 >= expiration,
                })
              } else {
                rej(error)
              }
            })
            .catch((error) => {
              rej(error)
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

const getTx = (txRaw) => txRaw.transactionHash
const getTxRouter = (txId) => {
  console.log('>>> getTxRouter', txId, `/trx/tx/${txId}`)
  return `/trx/tx/${txId}`
}

const getLinkToInfo = (tx) => {
  console.log('>>> getLinkToInfo', tx)
  if (!tx) return
  return `${config.link.tronExplorer}#/transaction/${tx}`
}

export default {
  login,
  getBalance,
  fetchBalance,
  getAllMyAddresses,
  getTransaction,
  send,
  fetchTxInfo,
  getTxRouter,
  getLinkToInfo,
  getWeb3,
  getTx,
}