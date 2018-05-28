import { nimiq } from 'helpers/nimiq'
import reducers from 'redux/core/reducers'
import config from 'app-config'

const NETWORK = config.entry === 'mainnet' ? 'main' : 'test'

const login = async (ethPrivateKey) => {
  let data = await nimiq.login(ethPrivateKey, NETWORK)

  reducers.user.setAuthData({ name: 'nimData', data })

  return data
}

const getBalance = async (address) => {
  let amount = await nimiq.getBalance(address)
  reducers.user.setBalance({ name: 'nimData', amount })
}

const getTransaction = () => {}
const send = (from, to, amount) => {
  let tx_sent = nimiq.withdraw(to, amount)
  tx_sent.then(() => getBalance())

  return tx_sent
}

export default {
  login,
  getBalance,
  getTransaction,
  send,
}
