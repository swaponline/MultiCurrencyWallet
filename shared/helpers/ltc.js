import coininfo from 'coininfo'


const networkCoininfo = process.env.MAINNET ? coininfo.litecoin.main : coininfo.litecoin.test
const network = networkCoininfo.toBitcoinJS()

export default {
  network,
}
