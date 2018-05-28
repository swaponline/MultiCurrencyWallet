import bitcoin from 'bitcoinjs-lib'


const network = process.env.MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet


export default {
  network,
}
