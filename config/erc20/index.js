import mainnet from './_mainnet'
import testnet from './_testnet'


const erc20 = process.env.MAINNET ? mainnet : testnet


export default {
  erc20,
}
