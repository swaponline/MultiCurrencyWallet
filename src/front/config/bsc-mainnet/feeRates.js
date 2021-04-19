let ethGasApiLink = 'https://noxon.wpmix.net/ethGas.php'

if (typeof window !== 'undefined') {
  if (window.defipulse_api_key) {
    ethGasApiLink = `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${window.defipulse_api_key}`
  }
}

export default {
  // TODO: need to find an API for Bsc
  bnb: ethGasApiLink,
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
