// https://data.defipulse.com/
const defiPulseDataKey = '13a47f7fefb672a5d7a7b397c4c2e044e3ab5a30876717b0083bea9c2dc5'

export default {
  // eth: 'https://www.etherchain.org/api/gasPriceOracle',
  // info from last block in mempool
  eth: `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${defiPulseDataKey}`,
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
