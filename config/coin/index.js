import mainnet from './_mainnet'
import testnet from './_testnet'


const coin = process.env.MAINNET ? mainnet : testnet


export default {
  coin,
}
