import Web3 from 'web3'
import testConfig from '../../src/front/config/testnet'
import DEFAULT_CURRENCY_PARAMETERS from '../../src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import ethLikeHelper from '../../src/common/helpers/ethLikeHelper'
import actions from '../../src/front/shared/redux/actions'
import testWallets from '../testWallets'

const ethWeb3 = new Web3(
  new Web3.providers.HttpProvider(testConfig.web3.provider)
)
const bscWeb3 = new Web3(
  new Web3.providers.HttpProvider(testConfig.web3.binance_provider)
)
const maticWeb3 = new Web3(
  new Web3.providers.HttpProvider(testConfig.web3.matic_provider)
)
const arbitrumWeb3 = new Web3(
  new Web3.providers.HttpProvider(testConfig.web3.arbitrum_provider)
)
const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function repeatActionWithDelay(params) {
  const { times, delay, callback } = params

  for (let i = 0; i < times; i += 1) {
    await timeOut(delay)

    const success = await callback()

    if (success) break
  }
}

describe('Sending EVM Coin', () => {
  const waitingTxMining = 30_000
  const requestsForTxInfo = 4
  const extraDelay = 10_000
  const waitingForTheTest = waitingTxMining * requestsForTxInfo + extraDelay
  
  type Coin = string
  type UsualSettings = {
    web3: IUniversalObj,
    paramsToSend: {
      externalAddress: string
      externalPrivateKey: string
      to: string
      amount: number
      speed: string
      gasLimit: number
      gasPrice?: number
    }
  }

  type UsualTxItem = [Coin, UsualSettings]
  
  const usualTxCases: UsualTxItem[] = [
    [
      'ETH',
      {
        web3: ethWeb3,
        paramsToSend: {
          externalAddress: testWallets.eth.address.toLowerCase(),
          externalPrivateKey: testWallets.eth.privateKey,
          to: testWallets.eth.address.toLowerCase(),
          amount: 0.001,
          speed: 'fast',
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
        },
      },
    ],
    [
      'BNB',
      {
        web3: bscWeb3,
        paramsToSend: {
          externalAddress: testWallets.bnb.address.toLowerCase(),
          externalPrivateKey: testWallets.bnb.privateKey,
          to: testWallets.bnb.address.toLowerCase(),
          amount: 0.001,
          speed: 'fast',
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
        },
      },
    ],
    [
      'MATIC',
      {
        web3: maticWeb3,
        paramsToSend: {
          externalAddress: testWallets.matic.address.toLowerCase(),
          externalPrivateKey: testWallets.matic.privateKey,
          to: testWallets.matic.address.toLowerCase(),
          amount: 0.001,
          speed: 'fast',
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
        },
      },
    ],
    [
      'ARBETH',
      {
        web3: arbitrumWeb3,
        paramsToSend: {
          externalAddress: testWallets.arbeth.address.toLowerCase(),
          externalPrivateKey: testWallets.arbeth.privateKey,
          to: testWallets.arbeth.address.toLowerCase(),
          amount: 0.0001,
          speed: 'fast',
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.arbeth.limit.send,
        },
      },
    ],
  ]

  it.each(usualTxCases)('sending usual %s transaction', async (
    coinName: Coin,
    settings: UsualSettings,
  ) => {
    const { web3, paramsToSend } = settings
    const lowerCoinName = coinName.toLowerCase()

    paramsToSend.gasPrice = await ethLikeHelper[lowerCoinName].estimateGasPrice()

    const response = await actions[lowerCoinName].send(paramsToSend)

    expect(response.transactionHash).toMatch(/0x[A-Za-z0-9]{2}/)

    // wait for a while until transaction gets into the blockchain
    let receipt: IUniversalObj | null = null

    // wait for a while until transaction gets into the blockchain
    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await web3.eth.getTransactionReceipt(response.transactionHash)

        if (receipt !== null) return true
      },
    })

    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    if (!receipt) {
      throw new Error('Transaction receipt is not found')
    }

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(paramsToSend.externalAddress)
    expect(to).toBe(paramsToSend.to)
  }, waitingForTheTest)

  type AdminSettings = {
    web3: IUniversalObj
    paramsToSend: {
      amount: number
      gasLimit: number
      from: string
      privateKey: string
      gasPrice?: number
      externalAdminFeeObj: {
        fee: number
        address: string
        min: number
      },
    },
  }

  type AdminTxItem = [Coin, AdminSettings]

  const adminTxCases: AdminTxItem[] = [
    [
      'ETH',
      {
        web3: ethWeb3,
        paramsToSend: {
          amount: 0.001,
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
          from: testWallets.eth.address.toLowerCase(),
          privateKey: testWallets.eth.privateKey,
          externalAdminFeeObj: {
            fee: 7,
            address: testWallets.evmAdmin.address,
            min: 0.001,
          },
        },
      },
    ],
    [
      'BNB',
      {
        web3: bscWeb3,
        paramsToSend: {
          amount: 0.001,
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
          from: testWallets.bnb.address.toLowerCase(),
          privateKey: testWallets.bnb.privateKey,
          externalAdminFeeObj: {
            fee: 7,
            address: testWallets.evmAdmin.address,
            min: 0.001,
          },
        },
      },
    ],
    [
      'MATIC',
      {
        web3: maticWeb3,
        paramsToSend: {
          amount: 0.001,
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send,
          from: testWallets.matic.address.toLowerCase(),
          privateKey: testWallets.matic.privateKey,
          externalAdminFeeObj: {
            fee: 7,
            address: testWallets.evmAdmin.address,
            min: 0.001,
          },
        },
      },
    ],
    [
      'ARBETH',
      {
        web3: arbitrumWeb3,
        paramsToSend: {
          amount: 0.0001,
          gasLimit: DEFAULT_CURRENCY_PARAMETERS.arbeth.limit.send,
          from: testWallets.arbeth.address.toLowerCase(),
          privateKey: testWallets.arbeth.privateKey,
          externalAdminFeeObj: {
            fee: 1,
            address: testWallets.evmAdmin.address,
            min: 0.0001,
          },
        },
      },
    ],
  ]

  it.each(adminTxCases)('sending admin %s transaction', async (
    coinName: Coin,
    settings: AdminSettings,
  ) => {
    const { web3, paramsToSend } = settings
    const lowerCoinName = coinName.toLowerCase()

    paramsToSend.gasPrice = await ethLikeHelper[lowerCoinName].estimateGasPrice()

    const txHash = await actions[lowerCoinName].sendAdminTransaction(paramsToSend)

    expect(txHash).toMatch(/0x[A-Za-z0-9]{64}/)

    let receipt: IUniversalObj | null = null

    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await web3.eth.getTransactionReceipt(txHash)

        if (receipt !== null) return true
      },
    })

    expect(receipt).not.toBeNull()

    if (!receipt) {
      throw new Error('Transaction receipt is not found')
    }

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets[lowerCoinName].address.toLowerCase())
    expect(to).toBe(paramsToSend.externalAdminFeeObj.address.toLowerCase())
  }, waitingForTheTest)
})