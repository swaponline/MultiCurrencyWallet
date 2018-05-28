import bitcoin from 'bitcoinjs-lib'


const network = process.env.MAINNET ? bitcoin.mainnet : bitcoin.networks.testnet


export default {
  network,
}
