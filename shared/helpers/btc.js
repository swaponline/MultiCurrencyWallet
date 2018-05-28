import bitcoin from 'bitcoinjs-lib'


const network = process.env.MAINNET ? bitcoin.mainnet : bitcoin.testnet


export default {
  network,
}
