import mainnet from './_mainnet'
import testnet from './_testnet'


const link = process.env.MAINNET ? mainnet : testnet


export default {
  link,
}
