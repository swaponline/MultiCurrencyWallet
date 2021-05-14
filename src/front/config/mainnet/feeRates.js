import api from './api'

let ethGasApiLink = 'https://noxon.wpmix.net/ethGas.php'

if (typeof window !== 'undefined') {
  if (window.defipulse_api_key) {
    ethGasApiLink = `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${window.defipulse_api_key}`
  }
}

export default {
  // eth: 'https://www.etherchain.org/api/gasPriceOracle',
  eth: ethGasApiLink, // info from last block in mempool
  bsc: `https://api.bscscan.com/api?module=proxy&action=eth_gasPrice&apikey=${api.bscscan_ApiKey}`,
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
