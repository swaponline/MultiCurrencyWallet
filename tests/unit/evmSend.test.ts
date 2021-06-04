import Web3 from 'web3'
import testConfig from '../../src/front/config/testnet'
import DEFAULT_CURRENCY_PARAMETERS from '../../src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import ethLikeHelper from '../../src/common/helpers/ethLikeHelper'
import actions from '../../src/front/shared/redux/actions'
import testWallets from '../testWallets'

const ethWeb3 = new Web3( new Web3.providers.HttpProvider(testConfig.web3.provider) )
const bscWeb3 = new Web3( new Web3.providers.HttpProvider(testConfig.web3.binance_provider) )
const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function repeatActionWithDelay(params) {
  const { times, delay, callback } = params

  for (let i = 0; i < times; i += 1) {
    await timeOut(delay)

    const success = await callback()

    if (success) break
  }
}

describe('Sending ETH', () => {
  const waitingTxMining = 30_000 // ms
  const requestsForTxInfo = 3
  const extraDelay = 10_000
  const waitingForTheTest = waitingTxMining * requestsForTxInfo + extraDelay
  const customAmount = 0.001
  let gasPrice = 0

  beforeEach(async () => {
    gasPrice = await ethLikeHelper.eth.estimateGasPrice()
  })

  it(`send the user transaction (amount: ${customAmount} ETH)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send
    const paramsToSend = {
      externalAddress: testWallets.eth.address.toLowerCase(),
      externalPrivateKey: testWallets.eth.privateKey,
      to: testWallets.eth.address.toLowerCase(),
      amount: customAmount,
      speed: 'fast',
      gasPrice,
      gasLimit,
    }
    const response = await actions.eth.send(paramsToSend)

    expect(response.transactionHash).toMatch(/0x[A-Za-z0-9]{2}/)
    // wait for a while until transaction gets into the blockchain
    let receipt = null

    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await ethWeb3.eth.getTransactionReceipt(response.transactionHash)

        if (receipt !== null) return true
      },
    })

    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(paramsToSend.externalAddress)
    expect(to).toBe(paramsToSend.to)
  }, waitingForTheTest)

  it(`send the admin transaction (amount: ${customAmount} ETH)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send
    const adminObj = {
      fee: 7,
      address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
      min: 0.01,
    }
    const paramsToSend = {
      amount: customAmount,
      gasPrice,
      gasLimit,
      privateKey: testWallets.eth.privateKey,
      externalAdminFeeObj: adminObj,
    }
    const txHash = await actions.eth.sendAdminTransaction(paramsToSend)

    expect(txHash).toMatch(/0x[A-Za-z0-9]{64}/)

    let receipt = null

    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await ethWeb3.eth.getTransactionReceipt(txHash)

        if (receipt !== null) return true
      },
    })

    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets.eth.address.toLowerCase())
    expect(to).toBe(adminObj.address.toLowerCase())
  }, waitingForTheTest)
})

describe('Sending BNB', () => {
  const waitingTxMining = 30_000
  const requestsForTxInfo = 3
  const extraDelay = 10_000
  const waitingForTheTest = waitingTxMining * requestsForTxInfo + extraDelay
  const customAmount = 0.001
  let gasPrice = 0

  beforeEach(async () => {
    gasPrice = await ethLikeHelper.bnb.estimateGasPrice()
  })

  it(`send the user transaction (amount: ${customAmount} BNB)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send
    const paramsToSend = {
      externalAddress: testWallets.bnb.address.toLowerCase(),
      externalPrivateKey: testWallets.bnb.privateKey,
      to: testWallets.bnb.address.toLowerCase(),
      amount: customAmount,
      speed: 'fast',
      gasPrice,
      gasLimit,
    }
    const response = await actions.bnb.send(paramsToSend)

    expect(response.transactionHash).toMatch(/0x[A-Za-z0-9]{2}/)

    // wait for a while until transaction gets into the blockchain
    let receipt = null

    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await bscWeb3.eth.getTransactionReceipt(response.transactionHash)

        if (receipt !== null) return true
      },
    })

    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(paramsToSend.externalAddress)
    expect(to).toBe(paramsToSend.to)
  }, waitingForTheTest)

  it(`send the admin transaction (amount: ${customAmount} BNB)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.evmLike.limit.send
    const adminObj = {
      fee: 7,
      address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
      min: 0.01,
    }
    const paramsToSend = {
      amount: customAmount,
      gasPrice,
      gasLimit,
      privateKey: testWallets.bnb.privateKey,
      externalAdminFeeObj: adminObj,
    }
    const txHash = await actions.bnb.sendAdminTransaction(paramsToSend)

    expect(txHash).toMatch(/0x[A-Za-z0-9]{64}/)

    let receipt = null

    await repeatActionWithDelay({
      times: requestsForTxInfo,
      delay: waitingTxMining,
      callback: async () => {
        receipt = await bscWeb3.eth.getTransactionReceipt(txHash)

        if (receipt !== null) return true
      },
    })

    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets.bnb.address.toLowerCase())
    expect(to).toBe(adminObj.address.toLowerCase())
  }, waitingForTheTest)
})