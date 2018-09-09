import bch from 'bitcoincashjs'


const network = process.env.MAINNET ? bch.Networks.livenet : bch.Networks.testnet


export default {
  network,
}
