import mainnet from './_mainnet'
import testnet from './_testnet'


const swapContract = process.env.MAINNET ? mainnet : testnet


export default {
  swapContract,
}
