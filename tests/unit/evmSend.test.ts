import Web3 from 'web3'
import testConfig from '../../src/front/config/testnet'
import DEFAULT_CURRENCY_PARAMETERS from '../../src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import ethLikeHelper from '../../src/common/helpers/ethLikeHelper'
import actions from '../../src/front/shared/redux/actions'
import testWallets from '../testWallets'

const ethWeb3 = new Web3( new Web3.providers.HttpProvider(testConfig.web3.provider) )
const bscWeb3 = new Web3( new Web3.providers.HttpProvider(testConfig.web3.binance_provider) )
const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Sending ETH', () => {
  const waitingTxMining = 60_000
  const waitingForTheTest = 80_000 // ms
  const customAmount = 0.001
  let gasPrice = 0

  beforeEach(async () => {
    gasPrice = await ethLikeHelper.eth.estimateGasPrice()
  })

  it(`send the user transaction (amount: ${customAmount} ETH)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
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
    await timeOut(waitingTxMining)
    
    const receipt = await ethWeb3.eth.getTransactionReceipt(response.transactionHash)
    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(paramsToSend.externalAddress)
    expect(to).toBe(paramsToSend.to)
  }, waitingForTheTest)

  it(`send the admin transaction (amount: ${customAmount} ETH)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
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

    await timeOut(waitingTxMining)

    const receipt = await ethWeb3.eth.getTransactionReceipt(txHash)

    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets.eth.address.toLowerCase())
    expect(to).toBe(adminObj.address.toLowerCase())
  }, waitingForTheTest)
})

describe('Sending BNB', () => {
  const waitingTxMining = 40_000
  const waitingForTheTest = 80_000 // ms
  const customAmount = 0.001
  let gasPrice = 0

  beforeEach(async () => {
    gasPrice = await ethLikeHelper.bnb.estimateGasPrice()
  })

  it(`send the user transaction (amount: ${customAmount} BNB)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
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
    await timeOut(waitingTxMining)
    
    const receipt = await bscWeb3.eth.getTransactionReceipt(response.transactionHash)
    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(paramsToSend.externalAddress)
    expect(to).toBe(paramsToSend.to)
  }, waitingForTheTest)

  it(`send the admin transaction (amount: ${customAmount} BNB)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.bnb.limit.send
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

    await timeOut(waitingTxMining)

    const receipt = await bscWeb3.eth.getTransactionReceipt(txHash)

    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets.bnb.address.toLowerCase())
    expect(to).toBe(adminObj.address.toLowerCase())
  }, waitingForTheTest)
})