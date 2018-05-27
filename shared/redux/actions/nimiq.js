import { nimiq } from 'helpers/nimiq'
import reducers from 'redux/core/reducers'

const login = async (ethPrivateKey) => {
  let data = await nimiq.login(ethPrivateKey)

  reducers.user.setAuthData({ name: 'nimData', data })
  console.info('Logged in with Nimiq', data)

  return data
}

const getBalance = async (address) => {
  let amount = await nimiq.getBalance(address)
  reducers.user.setBalance({ name: 'nimData', amount })
}

const getTransaction = () => {}
const send = async (from, to, amount) => await nimiq.withdraw(to, amount)

export default {
  login,
  getBalance,
  getTransaction,
  send,
}
