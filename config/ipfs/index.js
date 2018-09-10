import mainnet from './_mainnet'
import testnet from './_testnet'


const ipfs = process.env.MAINNET ? mainnet : testnet


export default {
  ipfs,
}
