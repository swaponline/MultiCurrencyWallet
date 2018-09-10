import mainnet from './_mainnet'
import testnet from './_testnet'


console.log('process.env', process.env)

const web3 = process.env.MAINNET ? mainnet : testnet


export default {
  web3,
}
