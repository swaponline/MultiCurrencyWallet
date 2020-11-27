/* 
* https://data.defipulse.com/
* ^ get free key and add your url in whitelist
*/
const defiPulseDataKey = '72480b82c7d97d75f012ca4bc5cd76e42be21f077f91d0c0f4758fe20f28'

export default {
  // eth: 'https://www.etherchain.org/api/gasPriceOracle',
  // new api - info from last block in mempool
  eth: `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${defiPulseDataKey}`,
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
