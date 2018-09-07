import bch from 'bitcoincashjs'


const network = process.env.MAINNET ? bch.Networks.mainnet : bch.Networks.testnet


export default {
  network,
}
