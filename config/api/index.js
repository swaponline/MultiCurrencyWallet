import mainnet from './_mainnet'
import testnet from './_testnet'


const api = process.env.MAINNET ? mainnet : testnet


export default {
  api,
}
