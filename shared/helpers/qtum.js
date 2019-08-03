import { networks, generateMnemonic } from 'qtumjs-wallet'


const network = process.env.MAINNET ? networks.mainnet : networks.testnet
let wallet


const _getData = () => {
  const publicAddress = wallet.address
  const privateKey    = wallet.toWIF()

  return {
    privateKey,
    address: publicAddress,
  }
}

const createWallet = () => {
  const mnemonic  = generateMnemonic()
  const password  = 'superstrong'

  wallet = network.fromMnemonic(mnemonic, password)

  return _getData()
}

const restoreWallet = (privateKey) => {
  wallet = network.fromPrivateKey(privateKey)

  return _getData()
}

const getBalance = async () => {
  const info = await wallet.getInfo()

  return info.balance
}

const sendMoney = async (to, amount) => {
  const { txid: transactionId } = await wallet.send(to, amount * 1e8, { freeRate: 30000 })

  return transactionId
}


export default {
  createWallet,
  restoreWallet,
  getBalance,
  sendMoney,
}
