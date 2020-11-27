const ethGasApiLink = window.defipulse_api_key
  ? `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${window.defipulse_api_key}`
  : 'https://noxon.wpmix.net/ethGas.php'

export default {
  // eth: 'https://www.etherchain.org/api/gasPriceOracle',
  eth: ethGasApiLink, // info from last block in mempool
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
