import bitcoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'


const network = process.env.MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
const coinNetwork = process.env.MAINNET ? coininfo.litecoin.main : coininfo.litecoin.test


console.log('coinNetwork', coinNetwork)
console.log('coininfo.litecoin', coininfo.litecoin)

export default {
  network,
}
