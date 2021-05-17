import Web3 from 'web3'
import testConfig from '../src/front/config/testnet'
import DEFAULT_CURRENCY_PARAMETERS from '../src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import ethLikeHelper from '../src/common/helpers/ethLikeHelper'
import actions from '../src/front/shared/redux/actions'
import testWallets from './testWallets'

const web3 = new Web3(new Web3.providers.HttpProvider(testConfig.web3.provider))
const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Sending ETH', () => {
  const waitingForTheTest = 125_000 // ms
  const customAmount = 0.001
  let gasPrice = 0

  beforeEach(async () => {
    gasPrice = await ethLikeHelper.eth.estimateGasPrice({ speed: 'fast' })
  })

  it(`send the user transaction (amount: ${customAmount} ETH)`, async () => {
    const gasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
    const paramsToSend = {
      externalAddress: testWallets.eth.address.toLowerCase(),
      externalPrivateKey: testWallets.eth.privateKey,
      to: testWallets.eth.address,
      amount: customAmount,
      speed: 'fast',
      gasPrice,
      gasLimit,
    }
    const response = await actions.eth.send(paramsToSend)

    expect(response.transactionHash).toMatch(/0x[A-Za-z0-9]{2}/)

    await timeOut(60 * 1000)
    
    const receipt = await web3.eth.getTransactionReceipt(response.transactionHash)
    
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

    await timeOut(5 * 1000)

    const receipt = await web3.eth.getTransactionReceipt(txHash)
    // if receipt equals null then perhaps the transaction is still pending
    expect(receipt).not.toBeNull()

    const { status, from, to } = receipt

    expect(status).toBe(true)
    expect(from).toBe(testWallets.eth.address.toLowerCase())
    expect(to).toBe(adminObj.address.toLowerCase())
  }, waitingForTheTest)
})